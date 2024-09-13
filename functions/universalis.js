const fetch = require('node-fetch');

exports.handler = async function (event) {
    const { itemID, region, listings } = event.queryStringParameters;
    try {
        const response = await fetch(`https://universalis.app/api/v2/${region}/${itemID}?listings=${listings}&entries=0&hq=0&fields=itemID%2Clistings.worldName%2Clistings.total`);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch from Universalis' }),
        };
    }
};
