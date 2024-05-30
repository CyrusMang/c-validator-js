const schemaFormatter = schema => {
  if (typeof schema === 'string') {
    return {
      _type: 'string',
      condition: schema
    }
  } else if (Array.isArray(schema)) {
    return {
      _type: 'list',
      item: schema.length ? schema[0] : '',
    }
  } else if (typeof schema === 'object') {
    if (schema._type) {
      return schema
    }
    return {
      _type: 'dist',
      schema: schema,
    }
  } else if (typeof schema === 'function') {
    return {
      _type: 'custom',
      validation: schema,
    }
  }
  throw new Error('Schema syntax error')
}

module.exports = schemaFormatter