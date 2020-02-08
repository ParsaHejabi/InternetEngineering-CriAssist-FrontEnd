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
export const FORM_ALLDATA = gql(`
query Answers($id: ID!){
  formAnswersWithGivenFormId(formId: $id){
    _id
    value
  }
}
`);

export const FORM_ANSWER = gql(`
query Answer($id: ID!){
  formAnswer(_id: $id){
    value
  }
}
`);

export const FORM_FIELDS = gql(`
query FormField($id: ID!){
  form(_id: $id){
    _id
    title
    fields{
      name
      title
      type
      required
    }
  }
}
`);