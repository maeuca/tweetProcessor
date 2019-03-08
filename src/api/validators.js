import joi from 'joi'

const searchData = {
  index: joi.string().min(1).max(64).required()
}

export function isSearchDataValid({data}) {
  return validate(data, searchData)
}

function validate(data, schema) {
  const result = joi.validate(data, schema)
  if (result.error) {
    throw result.error
  }
  return true
}
