const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Extract parameters from the query string
    const { worldName, searchRange, itemID, listings, fields, apiType } = event.queryStringParameters;

    // Determine the URL to use based on the apiType parameter
    let universalisURL;
    if (apiType === 'type1') {
        universalisURL = `https://universalis.app/api/v2/${worldName}/${itemID}?listings=${listings}&entries=0&hq=0&fields=${fields}`;
    } else if (apiType === 'type2') {
        universalisURL = `https://universalis.app/api/v2/${searchRange}/${itemID}?listings=${listings}&entries=0&hq=0&fields=${fields}`;
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid apiType parameter' }),
        };
    }

    try {
        // Fetch data from Universalis
        const response = await fetch(universalisURL);
        const data = await response.json();

        // Return data as JSON
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
