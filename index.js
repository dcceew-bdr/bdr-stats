const useTestData = false; // Comment out when using test data

document.addEventListener('DOMContentLoaded', function () {
    fetchDataAndUpdateUI('stats');
    fetchDataAndUpdateUI('totals');
});

function fetchDataAndUpdateUI(type) {
    const baseUrl = useTestData ? '' : 'https://s3.ap-southeast-2.amazonaws.com/stats.bdrtesting.net/';
    const url = `${baseUrl}${type}.json`;

    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            if (type === 'stats') {
                const data = mapJsonToData(jsonData);
                updateTable("#stats tbody", data, false);
            } else if (type === 'totals') {
                updateTable("#totals tbody", jsonData, true);
            }

            // Update the last updated time if query_run_time is present
            if (jsonData.results.bindings.length > 0 && jsonData.results.bindings[0].query_run_time) {
                const queryRunTime = jsonData.results.bindings[0].query_run_time.value;
                updateLastUpdatedTime(queryRunTime, type);
            }
        });
}

function updateLastUpdatedTime(dateTimeString, type) {
    const formattedDate = new Date(dateTimeString).toLocaleString();
    const lastUpdatedId = type === 'stats' ? 'statsLastUpdatedTime' : 'totalsLastUpdatedTime'; // Adjust IDs as necessary
    document.getElementById(lastUpdatedId).textContent = `Last updated: ${formattedDate}`;
}


function mapJsonToData(jsonData) {
    return jsonData.results.bindings.map(binding => ({
        dataset: binding.rg.value,
        class: mapOpUriToClass(binding.op.value),
        count: binding.val.value,
        timestamp: binding.t.value
    }));
}

function updateTable(tableSelector, data, isTotal) {
    const tbody = document.querySelector(tableSelector);
    tbody.innerHTML = ''; // Clear existing rows

    if (isTotal) {
        // Process data for the totals table
        data.results.bindings.forEach(item => {
            const categoryLabel = mapCategoryUriToLabel(item.category.value); // You need to implement this function
            const total = item.total.value;
            // Optionally, process query_run_time if needed

            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${categoryLabel}</td><td>${total}</td>`;
            tbody.appendChild(tr);
        });
    } else {
        // Process data for the stats table (existing code)
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.dataset}</td><td>${item.class}</td><td>${item.count}</td><td>-</td>`;
            tbody.appendChild(tr);
        });
    }
}

function mapCategoryUriToLabel(uri) {
    // Example mapping function
    const mapping = {
        "https://example.com/ObservationsCount": "Observations",
        "https://example.com/DatasetsCount": "Datasets",
        "https://example.com/SamplesCount": "Samples"
    };
    return mapping[uri] || "Unknown Category";
}

function mapOpUriToClass(uri) {
    const mapping = {
        "https://example.com/DatasetsCount": {
            label: "TERN RDFDataset",
            uri: "https://w3id.org/tern/ontologies/tern/RDFDataset"
        },
        "https://example.com/SamplesCount": {label: "TERN Sample", uri: "https://w3id.org/tern/ontologies/tern/Sample"},
        "https://example.com/ObservationsCount": {
            label: "TERN Observation",
            uri: "https://w3id.org/tern/ontologies/tern/Observation"
        }
    };
    return mapping[uri] ? `<a href="${mapping[uri].uri}" target="_blank">${mapping[uri].label}</a>` : "Unknown Class";
}

// function updateTimestamp(jsonData) {
//     // Find the most recent timestamp in jsonData
//     let mostRecentTimestamp = new Date(Math.max(...jsonData.results.bindings.map(e => new Date(e.t.value))));
//     document.getElementById('updatedTime').textContent = `Updated: ${mostRecentTimestamp.toLocaleString()}`;
// }
//
// function updateLastUpdatedTime(dateTimeString) {
//     const formattedDate = new Date(dateTimeString).toLocaleString();
//     document.getElementById('lastUpdatedTime').textContent = ` - Last updated: ${formattedDate}`;
// }