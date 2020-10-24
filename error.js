class ValidationError {
    constructor(validation, path, message) {
        this.details = { validation, path, message }
    }
}

module.exports = ValidationError