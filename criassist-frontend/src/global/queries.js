import { gql } from "apollo-boost";

export const FORMS_LIST = gql(`
  {
    forms {
      _id
      title
    }
  }
`);
