const schemaFormatter = require('./schemaFormatter')
const operators = require('./operators')

class CValidator {
  constructor(schema) {
    this.schema = schemaFormatter(schema)
  }
  check(data, path) {
    let s = this.schema
    if (path) {
      s = findSchema(s, path)
    }
    return checker(s, data, path)
  }
}

const findSchema = (schema, path) => {
  let paths = path.split('.')
  let s = schema
  for (let p of paths) {
    if (s._type === 'dist') {
      s = s.schema[p]
    } else if (s._type === 'list') {
      s = s.item
    }
  }
  return s
}

const checker = (schema, value, path) => {
  schema = schemaFormatter(schema)
  
  let errors = []
  switch (schema._type) {
    case 'string':
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = operators[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      break
    case 'list':
      if (!Array.isArray(value)) {
        errors.push({
          path, message: '{name} should be a list'
        })
        break
      }
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = operators[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      let list = []
      for (let [i, _value] of value.entries()) {
        let [v, _errors] = checker(schema.item, _value, path ? `${path}.${i}` : i)
        if (_errors) {
          errors = [...errors, ..._errors]
        }
        list.push(v)
      }
      value = list
      break
    case 'dist':
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = operators[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      if (value === null) {
        break
      }
      if (typeof value !== 'object') {
        errors.push({
          path, message: '{name} is invalid'
        })
        break
      }
      let dist = {}
      for (let [k, s] of Object.entries(schema.schema)) {
        let [v, _errors] = checker(s, value[k], path ? `${path}.${k}` : k)
        if (_errors) {
          errors = [...errors, ..._errors]
        }
        dist[k] = v
      }
      value = dist
      break
    case 'custom':
      let [v, _errors] = schema.validation(path, value)
      if (_errors) {
        errors = [...errors, ..._errors]
      }
      value = v
      break
  }
  return [value, errors]
}

module.exports = CValidator