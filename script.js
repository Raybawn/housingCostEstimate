let version = "1.0.3, 16.01.2024, 16:47";
console.log("Version: " + version);

let dropZone = document.getElementById("drop_zone");
let output = document.getElementById("output");
let fileInput = document.getElementById("file_input");

let worldId = "";
let worldName = "";
let datacenterName = "";
let region = "";
let searchRange = "";

let defaultWorldName = "Phoenix";
let defaultDatacenterName = "Light";
let defaultRegion = "Europe";

let file = null;

let totalWorldNamePrice = 0;
let totalCheapestPrice = 0;

// COOKIE FUNCTIONS
// Check if the worldName, datacenterName, and region cookies exist and set the corresponding variables
let cookies = document.cookie.split("; ");
let worldCookie = cookies.find((row) => row.startsWith("worldName="));
let datacenterCookie = cookies.find((row) => row.startsWith("datacenterName="));
let regionCookie = cookies.find((row) => row.startsWith("region="));
let checkboxCookie = cookies.find((row) =>
    row.startsWith("onlySameDatacenter=")
);

// if there are no cookies, set the worldName, datacenterName, and region cookies to default values: "Phoenix", "Light", "Europe", and "onlySameDatacenter" to false
if (!worldCookie) {
    worldName = defaultWorldName;
    document.cookie = "worldName=Phoenix; SameSite=Lax";
    document.cookie = "worldId=56; SameSite=Lax";
} else {
    worldName = worldCookie.split("=")[1];
    worldId = worldCookie.split("=")[2];
}

if (!datacenterCookie) {
    datacenterName = defaultDatacenterName;
    document.cookie = "datacenterName=Light; SameSite=Lax";
} else {
    datacenterName = datacenterCookie.split("=")[1];
}

if (!regionCookie) {
    region = defaultRegion;
    document.cookie = "region=Europe; SameSite=Lax";
} else {
    region = regionCookie.split("=")[1];
}

if (!checkboxCookie) {
    document.cookie = "onlySameDatacenter=false; SameSite=Lax";
} else {
    onlySameDatacenter = checkboxCookie.split("=")[1];
}

console.log(document.cookie);

// DROPZONE FUNCTIONS

dropZone.onclick = function () {
    fileInput.click();
};

fileInput.onchange = function () {
    file = fileInput.files[0];
    processFile(file);
};

dropZone.ondrop = function (event) {
    event.preventDefault();
    this.style.backgroundColor = "transparent";

    file = event.dataTransfer.files[0];
    processFile(file);
};

dropZone.ondragover = function (event) {
    event.preventDefault();
    this.style.backgroundColor = "#ccc";
};

dropZone.ondragleave = function () {
    this.style.backgroundColor = "transparent";
};

// DROPDOWN AND CSV DOWNLOAD FUNCTIONS

// Fetch the worlds data when the page loads
fetch("worlds.json") // replace 'worlds.json' with the path to your JSON file
    .then((response) => response.json())
    .then((data) => {
        // Create a div to hold the dropdown and the button
        let div = document.createElement("div");

        // Create a select element
        let select = document.createElement("select");

        // // Create a placeholder option
        // let placeholder = document.createElement("option");
        // placeholder.value = "";
        // placeholder.text = "Select World";
        // placeholder.disabled = true;
        // placeholder.selected = true;
        // select.appendChild(placeholder);

        // Create an option for each world
        data.forEach(function (world) {
            let option = document.createElement("option");
            option.value = world.id;
            option.text = world.name;
            select.appendChild(option);
        });

        // Add an onchange event to the select element to store the selected world as a cookie
        select.onchange = function () {
            document.cookie = "worldId=" + this.value + "; SameSite=Lax";
            worldName = this.options[this.selectedIndex].text;
            document.cookie = "worldName=" + worldName + "; SameSite=Lax";

            // Fetch the worlds data
            fetch("worlds.json")
                .then((response) => response.json())
                .then((worlds) => {
                    // Find the world with the selected name
                    let selectedWorldName = this.options[this.selectedIndex].text;
                    let world = worlds.find((world) => world.name === selectedWorldName);

                    if (world) {
                        worldId = world.id;
                        document.cookie = "worldId=" + worldId + "; SameSite=Lax";

                        // Fetch the datacenter data
                        fetch("datacenters.json")
                            .then((response) => response.json())
                            .then((datacenters) => {
                                // Find the datacenter that contains the selected world
                                let datacenter = datacenters.find((datacenter) =>
                                    datacenter.worlds.includes(worldId)
                                );

                                if (datacenter) {
                                    datacenterName = datacenter.name;
                                    region = datacenter.region;
                                    document.cookie =
                                        "datacenterName=" + datacenterName + "; SameSite=Lax";
                                    document.cookie = "region=" + region + "; SameSite=Lax";
                                    console.log(
                                        "Datacenter for selected world:",
                                        datacenterName,
                                        "Region:",
                                        region
                                    );
                                } else {
                                    console.log("No datacenter found for selected world");
                                }
                            })
                            .catch((error) => console.error("Error:", error));
                    } else {
                        console.log("No world found with the selected name");
                    }
                })
                .catch((error) => console.error("Error:", error));

            // If a file has been selected, process it
            if (file) {
                processFile(file);
            }
        };

        // Check if the selectedWorld cookie exists and set the selected option if not set to the defaultWorldName
        let cookies = document.cookie.split("; ");
        let selectedWorld = cookies.find((row) => row.startsWith("worldId="));
        if (selectedWorld) {
            let selectedWorldId = selectedWorld.split("=")[1];
            select.value = selectedWorldId;
        } else {
            // If the selectedWorld cookie does not exist, set the selected option to the first option
            select.selectedIndex = defaultWorldName;
        }

        // Create a new div for the checkbox and label
        let checkboxDiv = document.createElement("div");

        // Create a checkbox for "Only same datacenter?"
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "onlySameDatacenter";

        // Create the label
        let label = document.createElement("label");
        label.htmlFor = "onlySameDatacenter";
        label.appendChild(document.createTextNode("Only same datacenter?"));

        // Append the checkbox and label to the new div
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);

        // Append the new div to the original div
        div.appendChild(checkboxDiv);

        // Add an onchange event to the checkbox to store the selected option as a cookie
        checkbox.onchange = function () {
            document.cookie = "onlySameDatacenter=" + this.checked + "; SameSite=Lax";
            // If a file has been selected, process it
            if (file) {
                processFile(file);
            }
        };

        // Check if the onlySameDatacenter cookie exists and set the checkbox
        let checkboxCookie = cookies.find((row) =>
            row.startsWith("onlySameDatacenter=")
        );

        if (checkboxCookie) {
            let onlySameDatacenter = checkboxCookie.split("=")[1];
            checkbox.checked = onlySameDatacenter === "true";
        }

        // Append the checkbox to the div
        div.appendChild(checkboxDiv);

        // Append the select element to the div
        div.appendChild(select);

        // Create download CSV button
        let button = document.createElement("button");
        button.innerText = "Download CSV";
        button.onclick = function () {
            let table = document.getElementById("myTable"); // ensure table is defined and refers to your table
            let csv = [];
            for (let i = 0; i < table.rows.length; i++) {
                let row = [];
                for (let j = 0; j < table.rows[i].cells.length; j++) {
                    let cellValue = table.rows[i].cells[j].innerText;
                    cellValue = cellValue.replace(/[\r\n]+/g, " "); // remove newline characters
                    if (j === 1) {
                        // if this is the "Amount" column
                        cellValue = cellValue.trim(); // remove trailing and leading whitespaces
                    }
                    row.push(cellValue);
                }
                csv.push(row.join("|")); // use "|" as the separator
            }

            // Join csv array into a string with newline characters between each row
            let csvString = csv.join("\n");

            // Add the totals to a new row at the end of the CSV after a blank line
            csvString += "\n\n";
            csvString += `Total (Price on ${worldName}): ${totalWorldNamePrice.toLocaleString()} Gil\nTotal (Cheapest Price): ${totalCheapestPrice.toLocaleString()} Gil`;

            let date = new Date();
            let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add leading zeros to the month
            let day = date.getDate().toString().padStart(2, "0"); // Add leading zeros to the day
            let year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year
            let currentDate = `${month}.${day}.${year}`;

            // get the current time
            let hours = date.getHours().toString().padStart(2, "0"); // Add leading zeros to the hours
            let minutes = date.getMinutes().toString().padStart(2, "0"); // Add leading zeros to the minutes
            let currentTime = `${hours}:${minutes}`;

            // add the date and current time to the csv
            csvString += `\nDate / Time: ${currentDate} / ${currentTime}`;

            let importedFileName = file.name;

            importedFileName =
                importedFileName.replace(/\.[^/.]+$/, "") + "_" + currentDate; // Remove the extension from the imported file name and append the date

            // Add the .csv extension
            let exportedFileName = importedFileName + ".csv";

            // Use the exportedFileName when saving the CSV file
            let blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            if (navigator.msSaveBlob) {
                // IE 10+
                navigator.msSaveBlob(blob, exportedFileName);
            } else {
                let link = document.createElement("a");
                if (link.download !== undefined) {
                    // feature detection
                    // Browsers that support HTML5 download attribute
                    let url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", exportedFileName);
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        };

        // Append the button to the div
        div.appendChild(button);

        // Insert the div after the dropzone
        dropZone.parentNode.insertBefore(div, dropZone.nextSibling);
    })
    .catch((error) => console.error("Error:", error));

// GET JSON DATA

// Fetch the JSON data when the page loads
fetch("items.json") // replace 'items.json' with the path to your JSON file
    .then((response) => response.json())
    .then((data) => (jsonData = data))
    .catch((error) => console.error("Error:", error));

// Fetch the item names data when the page loads
fetch("itemNames.json") // replace 'itemNames.json' with the path to your JSON file
    .then((response) => response.json())
    .then((data) => (itemNames = data))
    .catch((error) => console.error("Error:", error));

// PROCESS FILES

function processFile(file) {
    // Reset the totals
    totalWorldNamePrice = 0;
    totalCheapestPrice = 0;

    output.innerHTML = ""; // clear the output div
    if (file.type == "text/plain") {
        let reader = new FileReader();
        reader.onload = function (e) {
            let text = e.target.result;
            let lines = text.split("\n");
            let items = [];
            for (let j = 0; j < lines.length; j++) {
                // Stop processing if the line is empty
                if (lines[j].trim() === "") {
                    break;
                }
                items.push(lines[j]);
            }
            let table = document.createElement("table");
            table.id = "myTable"; // assign an id to the table

            // Create table header
            let headerRow = document.createElement("tr");
            [
                "Item",
                "ItemDE",
                "Amount",
                "ID",
                "Is Craftable?",
                "Is Purchasable?",
                "Buy From Vendor Price",
                "Is Sold In Square Store?",
                "Is Tradable?",
                "Acquisition",
                `Price on ${worldName}`,
                "Cheapest World",
                "Cheapest Price",
            ].forEach(function (header) {
                let headerCell = document.createElement("th");
                headerCell.innerText = header;
                headerRow.appendChild(headerCell);
            });
            table.appendChild(headerRow);

            // Collect all the fetch promises here
            let fetchPromises = [];

            // Create table body
            items.forEach(function (itemLine) {
                let [itemName, itemAmount] = itemLine.split(": ");
                let itemData = jsonData.find((item) => item.name === itemName.trim());
                if (itemData) {
                    let row = document.createElement("tr");
                    let itemNameDE = itemNames[itemData.id].de;

                    let cells = [
                        itemName,
                        itemNameDE,
                        itemAmount,
                        itemData.id,
                        itemData["is craftable?"],
                        itemData["is purchasable?"],
                        itemData["buy from vendor price"],
                        itemData["is sold in square store?"],
                        itemData["is tradable?"],
                        itemData.acquisition,
                        "", // Placeholder for "Price on..." cell
                        "", // Placeholder for "Cheapest World"
                        "", // Placeholder for "Cheapest Price"
                    ];

                    cells.forEach(function (value, index) {
                        let cell = document.createElement("td");
                        cell.innerText = value;
                        row.appendChild(cell);
                    });

                    table.appendChild(row); // Append the row to the table immediately

                    let listingAmount = itemAmount < 5 ? 10 : itemAmount * 2;

                    // Function to fetch data from the Netlify function
                    const fetchDataFromNetlify = async (apiType, worldName, searchRange, itemID, listingAmount, fields) => {
                        const url = `https://housing.ashyro.io/.netlify/functions/universalis?apiType=${apiType}&worldName=${worldName}&searchRange=${searchRange}&itemID=${itemID}&listings=${listingAmount}&fields=${encodeURIComponent(fields)}`;
                        const response = await fetch(url);
                        const data = await response.json();
                        return data;
                    };
                    // Fetch the price for the current world (worldName)
                    const fetchPricesForWorld = async (worldName, itemData, listingAmount) => {
                        try {
                            const fields = 'itemID,listings.lastReviewTime,listings.total';
                            const data = await fetchDataFromNetlify('type1', worldName, '', itemData.id, listingAmount, fields);

                            if (data.listings && data.listings.length > 0) {
                                let prices = data.listings.map((listing) => listing.total);
                                prices.sort((a, b) => a - b);

                                let median = prices.length % 2 === 0
                                    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                                    : prices[(prices.length - 1) / 2];

                                row.cells[10].innerText = Math.round(median);
                            } else {
                                row.cells[10].innerText = "N/A";
                            }

                            totalWorldNamePrice += itemAmount * Math.round(
                                row.cells[6].innerText > 0
                                    ? row.cells[6].innerText
                                    : row.cells[10].innerText
                            );
                        } catch (error) {
                            console.error('Error fetching data for world:', error);
                            row.cells[10].innerText = "Error";
                        }
                    };

                    // Determine if we should search the entire region or just the same datacenter
                    const fetchPricesForCheapestWorld = async (searchRange, itemData, listingAmount) => {
                        try {
                            const fields = 'itemID,listings.worldName,listings.total';
                            const data = await fetchDataFromNetlify('type2', '', searchRange, itemData.id, listingAmount, fields);

                            if (data.listings && data.listings.length > 0) {
                                let worldNames = data.listings.map(listing => listing.worldName);
                                let worldCounts = {};
                                worldNames.forEach(world => {
                                    worldCounts[world] = (worldCounts[world] || 0) + 1;
                                });
                                let mostCommonWorld = Object.keys(worldCounts).reduce((a, b) =>
                                    worldCounts[a] > worldCounts[b] ? a : b
                                );

                                let prices = data.listings.map(listing => listing.total);
                                prices.sort((a, b) => a - b);
                                let median = prices.length % 2 === 0
                                    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                                    : prices[(prices.length - 1) / 2];

                                row.cells[11].innerText = mostCommonWorld;
                                row.cells[12].innerText = Math.round(median);

                                totalCheapestPrice += itemAmount * Math.round(
                                    row.cells[6].innerText > 0
                                        ? row.cells[6].innerText
                                        : row.cells[12].innerText
                                );
                            } else {
                                row.cells[11].innerText = "N/A";
                                row.cells[12].innerText = "N/A";
                            }
                        } catch (error) {
                            console.error('Error fetching data for cheapest world:', error);
                            row.cells[11].innerText = "Error";
                            row.cells[12].innerText = "Error";
                        }
                    };

                    // Call the functions as needed
                    let fetchPromises = [];
                    fetchPromises.push(fetchPricesForWorld(worldName, itemData, listingAmount));

                    // Determine if we should search the entire region or just the same datacenter
                    let checkbox = document.getElementById("onlySameDatacenter");
                    searchRange = checkbox.checked ? datacenterName : region;

                    fetchPromises.push(fetchPricesForCheapestWorld(searchRange, itemData, listingAmount));


                    fetchPromises.push(fetchPromise2);
                }
            });

            // Append the table to the output div
            output.appendChild(table);

            // Wait for all fetches to complete
            Promise.all(fetchPromises).then(() => {
                let totalsContainer = document.getElementById("totals");
                totalsContainer.innerHTML = `Total (Price on ${worldName}): ${totalWorldNamePrice.toLocaleString()} Gil<br>Total (Cheapest Price): ${totalCheapestPrice.toLocaleString()} Gil`;
            }).catch((error) => {
                console.error("Error fetching data:", error);
            });
        };

        reader.readAsText(file);
    }
}
