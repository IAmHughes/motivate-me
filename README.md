# Motivate Me - GitHub Action
A GitHub action (written in JavaScript) that posts inspirational gifs on stale pull requests leveraging the [GIPHY API](https://developers.giphy.com/docs/api/endpoint/#search). Powered by GIPHY and GitHub Actions!

<a href="https://github.com/iamhughes/motivate-me"><img alt="GitHub Actions status" src="https://github.com/iamhughes/motivate-me/workflows/Tests/badge.svg"></a>

## Usage
### Pre-requisites
Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](#example-workflow---motivate-me) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
For more information on these inputs, see the [GIPHY API Documentation](https://developers.giphy.com/docs/api/endpoint/#search).

- `query`: The [search query](https://developers.giphy.com/docs/api/endpoint/#search) word or phrase to use when returning a GIF. Default: `motivation`
- `rating`: The [content rating](https://developers.giphy.com/docs/optional-settings#rating) used to filter results from the GIF search. Default: `g`
- `lang`: The [default language](https://developers.giphy.com/docs/optional-settings#language-support) that the search query is in. Default: `en` for English
- `stale_days`: Number of days of inactivity before a pull request receives motivation. Default: `14`

### Outputs
For more information on these outputs, see the [GIPHY API Documentation](https://developers.giphy.com/docs/api/schema/) for an example of what these outputs look like.

- `id`: The GIF's unique ID on GIPHY
- `title`: The title that appears on GIPHY for the GIF
- `gif_url`: The publicly-accessible direct URL for the GIF on GIPHY

### Example workflow - motivate me
Every day, [query open pull requests](https://developer.github.com/v3/pulls/#list-pull-requests) that are `stale` and add an inspirational [comment](https://developer.github.com/v3/issues/comments/#create-a-comment) powered by GIPHY to add a GIF:

```yaml
on:
  schedule:
  - cron: 0 0 * * *  # Midnight every day – https://crontab.guru

name: Motivate Me

jobs:
  motivation:
    name: Motivate Me
    runs-on: ubuntu-latest
    steps:
      - name: Motivate Me
        id: motivate_me
        uses: iamhughes/motivate-me@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token
          GIPHY_TOKEN: ${{ secrets.GIPHY_TOKEN }} # This token should be created on giphy.com: https://developers.giphy.com/dashboard/?create=true
        with:
          query: 'motivation'
          rating: 'g'
          lang: 'en'
          stale_days: 14
```

## Contributing
I would love for you to contribute, pull requests are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License
The scripts and documentation in this project are released under the [GNU License](LICENSE)
