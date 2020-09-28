const GraphQLClient = require("graphql-request").GraphQLClient;
const gql = require("graphql-request").gql;
const request = require("graphql-request").request;

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

const graphQLClient = new GraphQLClient("https://api.yelp.com/v3/graphql", {
  Headers: {
    Authorization:
      "bearer a9ydWkHMS9i_z-JX8lFJCgP68Qo0VjkqxJRIoZZI9IUJIamPhK8HC-n-Yk9138FCylLdpVdVeCn41J1Ujzkt0Qq-L2IlCxBqLeTw-jg1RdT-uy6TpW9JiTcB3D1QX3Yx",
      'Accept-Language': 'en_US'
  },
});

graphQLClient
  .request(query_gql)
  .then((data) => {
    console.log(`recieved: ${JSON.stringify(data)}`);
  })
  .catch((e) => console.log(`ERROR: ${e}`));

// request("https://api.yelp.com/v3/graphql", query_gql).then((d) => console.log(d))
