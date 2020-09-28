
// WITH AXIOS, GQL AND JSON

const axios = require("axios");
const gql = require("graphql-request").gql;

// const gql = require("apollo-link");

const query = {
  query: `business(id: $business_name) {
        name
        id
        rating
        url
    }`,
  variables: {
    business_name: "garaje-san-francisco",
  },
};

const query_gql = gql`{
    business(id: "garaje-san-francisco") {
        name
        id
        rating
        url
    }
}`;

// axios({
//   url: "https://opentdb.com/api_category.php",
//   method: "GET",
// })
//   .then((r) => console.log(`response: ${JSON.stringify(r.data)}`))
//   .catch((e) => console.log(`error: ${e}`));

// axios
//   .get("https://opentdb.com/api_category.php")
//   .then((r) => console.log(`response: ${JSON.stringify(r.data)}`))
//   .catch((e) => console.log(`error: ${e}`));

const yelpGQL = axios({
  url: "https://api.yelp.com/v3/graphql",
  headers: {
    authorization:
      "Bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx",
    "Content-Type": "application/json",
    // "content-type": "application/graphql"
  },
  method: "POST",
  data: query,
});

yelpGQL
  .then((data) => console.log(`recieved: ${JSON.stringify(data)}`))
  .catch((r) => console.log(`rejected: ${JSON.stringify(r.toJSON())}`));
