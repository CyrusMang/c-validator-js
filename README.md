# c-validator-js
Validating and sanitizing data

  import Validate from 'c-validator'
  
  const schema = {
    name: 'required',
    slug: 'required|slug',
    contact: {
      email: 'required'
    }
  }
  const [value, errors] = Validate(schema, data)
  ...
