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
            if (type === 'totals') {
                updateTotalsTable(`#${type} tbody`, jsonData);
            } else { // Assumes 'stats'
                updateStatsTable(`#stats tbody`, jsonData);
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
    const lastUpdatedId = type === 'stats' ? 'statsLastUpdatedTime' : 'totalsLastUpdatedTime';
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

function updateStatsTable(tableSelector, jsonData) {
    const tbody = document.querySelector(tableSelector);
    tbody.innerHTML = ''; // Clear existing rows

    jsonData.results.bindings.forEach(item => {
        const name = item.rg_label ? item.rg_label.value : item.rg_uri.value; // Use rg_label if available, else fall back to rg_uri
        const uri = item.rg_uri.value;
        const datasetsCount = item.DatasetsCount ? item.DatasetsCount.value : "0";
        const samplesCount = item.SamplesCount ? item.SamplesCount.value : "0";
        const observationsCount = item.ObservationsCount ? item.ObservationsCount.value : "0";

        // Construct the row HTML
        const rowHtml = `<tr>
            <td><a href="${uri}" target="_blank">${name}</a></td>
            <td>${datasetsCount}</td>
            <td>${samplesCount}</td>
            <td>${observationsCount}</td>
        </tr>`;

        tbody.innerHTML += rowHtml;
    });
}



function updateTotalsTable(tableSelector, jsonData) {
    const tbody = document.querySelector(tableSelector);
    tbody.innerHTML = ''; // Clear existing rows

    jsonData.results.bindings.forEach(item => {
        const categoryLabel = item.rg_label.value; // 'Datasets', 'Samples', or 'Observations'
        const total = item.total.value; // The total count for each category

        // Construct the row HTML
        const rowHtml = `<tr>
            <td>${categoryLabel}</td>
            <td>${total}</td>
        </tr>`;

        // Append the constructed row to the table body
        tbody.innerHTML += rowHtml;
    });
}



function mapCategoryUriToLabel(uri) {
    // Example mapping function
    const mapping = {
        "http://example.com/ObservationsCount": "Observations",
        "http://example.com/DatasetsCount": "Datasets",
        "http://example.com/SamplesCount": "Samples"
    };
    return mapping[uri] || "Unknown Category";
}

function mapOpUriToClass(uri) {
    const mapping = {
        "http://example.com/DatasetsCount": {
            label: "TERN RDFDataset",
            uri: "https://w3id.org/tern/ontologies/tern/RDFDataset"
        },
        "http://example.com/SamplesCount": {label: "TERN Sample", uri: "https://w3id.org/tern/ontologies/tern/Sample"},
        "http://example.com/ObservationsCount": {
            label: "TERN Observation",
            uri: "https://w3id.org/tern/ontologies/tern/Observation"
        }
    };
    return mapping[uri] ? `<a href="${mapping[uri].uri}" target="_blank">${mapping[uri].label}</a>` : "Unknown Class";
}
