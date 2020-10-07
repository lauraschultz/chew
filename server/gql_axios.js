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

const query_gql = gql`
  {
    business(id: "garaje-san-francisco") {
      name
      id
      rating
      url
    }
  }
`;

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

// const yelpGQL = axios({
//   url: "https://api.yelp.com/v3/graphql",
//   headers: {
//     Authorization:
//       "Bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx",
//     "Content-Type": "application/graphql",
//     // "content-type": "application/graphql"
//   },
//   method: "POST",
//   body: {
//     query: `{
//     business(id: "garaje-san-francisco") {
//         name
//         id
//         rating
//         url
//     }
// }`,
//   },
// });

// const deutscheBahn = axios({
//   url: "https://bahnql.herokuapp.com",
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   data: {
//     query:
//       '{\n stationWithEvaId(evaId: 8000105) {\n name\n location {\n latitude\n longitude\n }\n picture {\n url\n }\n }\n}\n\n# More complex query examples:\n#\n# Queries 5 stations within a distance of 2000m and their corresponding facilities and location\n# *Requires api subscription*: Stationen (StaDa)\n# {\n# nearby(latitude: 50.11, longitude: 8.66, radius: 2000) {\n# stations(count: 5) {\n# name\n# primaryEvaId\n# location {\n# latitude\n# longitude\n# }\n# facilities {\n# type\n# state\n# description\n# equipmentNumber\n# }\n# }\n# }\n# }\n#\n# Queries stations and operationLocations (Betriebsstellen) matching the search term "Flughafen"\n# Requires api subscription: Stationen (StaDa), Betriebsstellen\n# {\n# search(searchTerm: "Flughafen") {\n# stations {\n# name\n# primaryEvaId\n# }\n# operationLocations {\n# name\n# id\n# regionId\n# abbrev\n# locationCode\n# }\n# }\n# }\n',
//   },
// });

// const test = axios({
//   url: "https://1jzxrj179.lp.gql.zone/graphql",
//   method: "post",
//   data: {
//     query: `
//       query PostsForAuthor {
//         author(id: 1) {
//           firstName
//             posts {
//               title
//               votes
//             }
//           }
//         }
//       `,
//   },
// });

axios({
  url: "https://api.yelp.com/v3/graphql",
  headers: {
    Authorization:
      "Bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx",
      "Content-Type": "application/graphql",
    // "content-type": "application/graphql"
  },
  method: "POST",
  data: `{
    business(id: "garaje-san-francisco") {
        name
        id
        rating
        url
    }
}`,
  
})
  .then(({data}) => console.log(`DONE ${JSON.stringify(data)}`))
  .catch((r) => console.log(`ERROR`));
