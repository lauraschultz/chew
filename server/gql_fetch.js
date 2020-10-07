const express = require("express");
const fetch = require("node-fetch")

const app= express();

app.listen(4000, () => console.log("listening on port 4000."))

app.get('/', (req, res) => {
    console.log('ok');
    fetch("https://api.yelp.com/v3/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/graphql",
            Authorization: "Bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx"
        },
        body: JSON.stringify({
            query: `{
                business(id: "garaje-san-francisco") {
                    name
                    id
                    alias
                    rating
                    url
                }
            }`
        })
    }).then(r => console.log(`response: ${JSON.stringify(r)}`))
})