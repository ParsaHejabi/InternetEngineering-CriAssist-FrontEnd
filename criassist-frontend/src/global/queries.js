import { gql } from "apollo-boost";

export const FORMS_LIST = gql(`
  {
    forms {
      _id
      title
    }
  }
`);

//Answers where formID=$id
export const FORM_DATA = gql(`
query Answers($id: ID!){
  answers(formID: $id){
    _id
    fields {
      name
      title
      value
    }
  }
}
`);

export const FORM_FIELDS = gql(`
query Forms($id: ID!){
  forms(_id: $id){
    _id
    title
    fields {
      name
      title
      type
      required
    }
  }
}
`);