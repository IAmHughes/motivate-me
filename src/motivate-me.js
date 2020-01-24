const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const query = core.getInput('query', { required: false });
    const rating = core.getInput('rating', { required: false });
    const lang = core.getInput('lang', { required: false });
    const staleDays = core.getInput('stale_days', { required: false });

    // Gather list of open pull requests on the repository
    // API Documentation: https://developer.github.com/v3/pulls/#list-pull-requests
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-pulls-list
    const listPullRequestsResponse = await github.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'updated'
    });

    core.debug(`prResponse ${JSON.stringify(listPullRequestsResponse)}`);

    // Iterate through pull requests returned above and check date of last activity (`updated_at` field)
    // For each PR that matches stale filter:
    // Use index of PR in array for offset in below query for GIF on GIPHY
    // Create a comment
    let index;
    // eslint-disable-next-line no-plusplus
    for (index = 0; index < listPullRequestsResponse.data.length; index++) {
      if (listPullRequestsResponse.data[index].updated_at > staleDays) {
        core.debug(`listPRResponseData ${JSON.stringify(listPullRequestsResponse.data)}`);
      }
    }

    // Query GIPHY for a GIF!
    // API Documentation: https://developers.giphy.com/docs/api/endpoint/#search
    const searchForGifResponse = await axios.get(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${query}&limit=25&offset=0&rating=${rating}&lang=${lang}`
    );

    core.debug(`searchForGifResponse ${JSON.stringify(searchForGifResponse.data)}`);

    // Create a comment
    // API Documentation: https://developer.github.com/v3/issues/comments/#create-a-comment
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-issues-create-comment
    const createCommentResponse = await github.issues.createComment({
      owner,
      repo,
      issue_number: 1,
      body:
        'Get motivated! ![test](https://media3.giphy.com/media/87xihBthJ1DkA/giphy.gif?cid=790b76112656e5dfae313de575de097305815350cad3216d&rid=giphy.gif)'
    });

    core.debug(`createCommentResponse ${JSON.stringify(createCommentResponse)}`);
    core.debug(`createCommentResponseData ${JSON.stringify(createCommentResponse.data)}`);

    // Get the ID, title, and GIF URL for the GIF from the response
    // TODO: Move up before creating comment
    const {
      data: {
        id: gifId,
        title: gifTitle,
        images: {
          original: { url: gifUrl }
        }
      }
    } = searchForGifResponse;

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', gifId);
    core.setOutput('title', gifTitle);
    core.setOutput('gif_url', gifUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
