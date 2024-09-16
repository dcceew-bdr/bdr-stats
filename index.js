// Global variable to track the current sort state
let currentSort = {
    column: 'dateCreated',
    ascending: false // Assuming the default sort is descending
};

function pad(pad, str, padLeft) {
  if (typeof str === 'undefined')
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

let showDetailedStatsSection = function () {
    document.getElementById("detailedStatsSection").style.display = "block";
}


let myShowButtonPressed = function () {
    let myHash = "ef536f823d3b55c2d9d06972f88c58b1";
    let password = document.getElementById("statsPassword").value;
    let hash = CryptoJS.MD5(password).toString();
    if (hash === myHash) {
        const useTestData = false; // Set to true if you want to use test data
        showDetailedStatsSection()
        showStats('stats', useTestData);
    }
}



document.addEventListener("DOMContentLoaded", function () {
    const useTestData = false; // Set to true if you want to use test data
    showStats('totals', useTestData);
});

let showStats = function (kind, useTestData = false) {

    // This function fetches data based on the 'type' and updates the UI
    function fetchDataAndUpdateUI(type) {
        const baseUrl = useTestData ? '' : 'https://stbdrprodstatsudynhh.blob.core.windows.net/statscontainer/';
        const url = `${baseUrl}${type}.json`;

        fetch(url)
            .then(response => response.json())
            .then(jsonData => {
                let transformedData;
                if (type === 'totals') {
                    transformedData = transformTotalsData(jsonData);
                } else {
                    transformedData = transformStatsData(jsonData);
                    // Call the function to make the 'dateCreated' column sortable
                    transformedData.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
                }
                updateTable(`#${type}-template-target`, transformedData, `${type}-template`);

                // Update last updated time, if present
                if (jsonData.results.bindings.length > 0 && jsonData.results.bindings[0].queryRunTime) {
                    const queryRunTime = jsonData.results.bindings[0].queryRunTime.value;
                    updateLastUpdatedTime(queryRunTime, type);
                }
            })
            .catch(error => console.error('Error fetching data: ', error));
    }


    // This function updates the 'last updated time' display
    function updateLastUpdatedTime(dateTimeString, type) {
        const formattedDate = new Date(dateTimeString).toLocaleString();
        const lastUpdatedId = type === 'stats' ? 'statsLastUpdatedTime' : 'totalsLastUpdatedTime';
        document.getElementById(lastUpdatedId).textContent = `Last updated: ${formattedDate}`;
    }

    // Functions to update the tables using Handlebars
    function updateTable(selector, jsonData, templateId) {
        const templateScript = document.getElementById(templateId).innerHTML;
        const template = Handlebars.compile(templateScript);
        console.log({items: jsonData}); // Ensure this outputs the structure you expect
        const html = template({items: jsonData}); // Ensure jsonData is passed correctly
        document.querySelector(selector).innerHTML = html;
    }


    function transformTotalsData(jsonData) {
        return jsonData.results.bindings.map(item => ({
            category: item.rg_label.value,
            totalCount: item.total.value
        }));
    }

    function transformStatsData(jsonData) {
        return jsonData.results.bindings.map(item => ({
            datasetUri: item.rg_uri.value, // Include the URI for the hyperlink
            datasetLabel: item.rg_label.value, // The label of the dataset
            rdfDatasets: item.DatasetsCount.value, // The count of RDF datasets
            hasDatasets: parseInt(item.DatasetsCount.value) > 0, // Flag to indicate if the dataset has datasets
            samples: item.SamplesCount.value, // The count of samples
            samplings: item.SamplingsCount.value, // The count of samples
            observations: item.ObservationsCount.value, // The count of observations
            dateCreated: item.dateCreated.value // The date created
        }));
    }


    // Execute the fetchDataAndUpdateUI function for both 'totals' and 'stats'
    fetchDataAndUpdateUI(kind);
}


function sortColumn(elementId, columnIndex) {
    const table = document.getElementById(elementId);
    const rows = table.rows;

    // Toggle the class name for the clicked column header
    const headerCell = table.rows[0].cells[columnIndex];

    const isAscending = headerCell.classList.contains('sort-ascending');
    // Toggle the class name for the clicked column header
    headerCell.classList.toggle('sort-ascending', !isAscending);
    headerCell.classList.toggle('sort-descending', isAscending);

    // Get the sort order based on the current class name
    const sortOrder = headerCell.classList.contains('sort-ascending') ? 1 : -1;

    // Perform sorting logic here using the sort order and column index
    // For demonstration, you can just log the sorted rows to the console
    const sortedRows = Array.from(rows).slice(1).sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        return sortOrder * cellA.localeCompare(cellB, undefined, {numeric: true});
    });

    // Re-append sorted rows to the table body
    sortedRows.forEach(row => table.tBodies[0].appendChild(row));
}


