# Scaleway serverless automatic volume backup

This serverless function creates a backup of a given Scaleway volume every day and deletes all backups of the same volume older than seven days.

## Usage

1. Run `npm install`
2. Copy the `.env.example` file and name it `.env.production`.
3. Fill the variables with the required information
4. Run `serverless deploy`

## License

This repository is licensed under the MIT License (MIT). Please see [license file](license.md) for more information.
