const execute = require('apollo-link')
const HttpLink =require("apollo-link-http");
const gql =require("graphql");

const link = new HttpLink({ uri: "https://api.yelp.com/v3/graphql" });
const operation = {
  query: gql`
    query searchTerm($term: String) {
      search(term: $term, location: "san francisco") {
        total
        business {
          name
          rating
        }
      }
    }
  `,
};

console.log('hello');
execute(link, operation).subscribe({
    next: d => console.log(`recieved data: ${d}`),
    error: e => console.log(`recieved error: ${e}`),
    complete: () => console.log(`complete.`)
})
