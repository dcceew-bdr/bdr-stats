const useTestData = false; // Comment out when using test data

document.addEventListener('DOMContentLoaded', function () {
    // Assume useTestData toggles between local and remote data
    const jsonUrl = useTestData ? 'stats.json' : 'https://s3.ap-southeast-2.amazonaws.com/stats.bdrtesting.net/stats.json';

    fetch(jsonUrl)
        .then(response => response.json())
        .then(jsonData => {
            const data = mapJsonToData(jsonData);
            updateTable(data);
            updateTimestamp(jsonData); // Pass the entire jsonData to find the most recent timestamp
        });
});

function mapJsonToData(jsonData) {
    return jsonData.results.bindings.map(binding => ({
        dataset: binding.rg.value,
        class: mapOpUriToClass(binding.op.value),
        count: binding.val.value,
        timestamp: binding.t.value
    }));
}

function mapOpUriToClass(uri) {
    const mapping = {
        "https://example.com/DatasetsCount": {label: "TERN RDFDataset", uri: "https://w3id.org/tern/ontologies/tern/RDFDataset"},
        "https://example.com/SamplesCount": {label: "TERN Sample", uri: "https://w3id.org/tern/ontologies/tern/Sample"},
        "https://example.com/ObservationsCount": {label: "TERN Observation", uri: "https://w3id.org/tern/ontologies/tern/Observation"}
    };
    return mapping[uri] ? `<a href="${mapping[uri].uri}" target="_blank">${mapping[uri].label}</a>` : "Unknown Class";
}

function updateTable(data) {
    const tbody = document.querySelector("#stats tbody");
    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.dataset}</td><td>${item.class}</td><td>${item.count}</td><td>-</td>`;
        tbody.appendChild(tr);
    });
}


function updateTimestamp(jsonData) {
    // Find the most recent timestamp in jsonData
    let mostRecentTimestamp = new Date(Math.max(...jsonData.results.bindings.map(e => new Date(e.t.value))));
    document.getElementById('updatedTime').textContent = `Updated: ${mostRecentTimestamp.toLocaleString()}`;
}
