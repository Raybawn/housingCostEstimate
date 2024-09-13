const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const { apiType, worldName, searchRange, itemID, listings, fields } = event.queryStringParameters;

    // Construct the URL based on apiType
    let url = '';
    if (apiType === 'type1') {
        url = `https://universalis.app/api/v2/${worldName}/${itemID}?listings=${listings}&entries=0&hq=0&fields=${fields}`;
    } else if (apiType === 'type2') {
        url = `https://universalis.app/api/v2/${searchRange}/${itemID}?listings=${listings}&entries=0&hq=0&fields=${fields}`;
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid API type' }),
        };
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
