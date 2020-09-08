// // WITH GRAPHQL-REQUEST LIBRARY

// const GraphQLClient = require("graphql-request").GraphQLClient;
// const gql = require("graphql-request").gql;
// const request = require("graphql-request").request;

// const query_gql = gql`
//   {
//     business(id: "garaje-san-francisco") {
//       name
//       id
//       rating
//       url
//     }
//   }
// `;

// const graphQLClient = new GraphQLClient("https://api.yelp.com/v3/graphql", {
//   Headers: {
//     Authorization:
//       "bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx",
//       'Accept-Language': 'en_US'
//   },
// });

// graphQLClient
//   .request(query_gql)
//   .then((data) => {
//     console.log(`recieved: ${JSON.stringify(data)}`);
//   })
//   .catch((e) => console.log(`ERROR: ${e}`));

// // request("https://api.yelp.com/v3/graphql", query_gql).then((d) => console.log(d))

// WITH AXIOS, GQL AND JSON

const axios = require("axios");
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

// const query_gql = gql`{
//     business(id: "garaje-san-francisco") {
//         name
//         id
//         rating
//         url
//     }
// }`;

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

// WITH APOLLO-LINK

// const app = require("express");
// const execute = require('apollo-link')
// const HttpLink =require("apollo-link-http");
// const gql =require("graphql");

// const link = new HttpLink({ uri: "https://api.yelp.com/v3/graphql" });
// const operation = {
//   query: gql`
//     query searchTerm($term: String) {
//       search(term: $term, location: "san francisco") {
//         total
//         business {
//           name
//           rating
//         }
//       }
//     }
//   `,
// };

// execute(link, operation).subscribe({
//     next: d => console.log(`recieved data: ${d}`),
//     error: e => console.log(`recieved error: ${e}`),
//     complete: () => console.log(`complete.`)
// })
