const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

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
    const stale_days = core.getInput('stale_days', { required: false });
    
    // Gather list of open pull requests on the repository
    // API Documentation: https://developer.github.com/v3/pulls/#list-pull-requests
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-pulls-list
    const listPullRequestsResponse = await github.pulls.list({
      owner,
      repo
    });
    
    // Iterate through pull requests returned above and check date of last activity (`updated_at` field)
    // For each PR that matches stale filter:
    // Use index of PR in array for offset in below query for GIF on GIPHY
    // Create a comment
    
    // Query GIPHY for a GIF!
    // API Documentation: https://developers.giphy.com/docs/api/endpoint/#search
    const searchForGifResponse = $.get(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&q=${query}&limit=25&offset=0&rating=${rating}&lang=${lang}`);
    searchForGifResponse.done(function(data) { console.log("success got data", data); });

    // Create a comment
    // API Documentation: https://developer.github.com/v3/issues/comments/#create-a-comment
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-issues-create-comment
    const createCommentResponse = await github.repos.createComment({
      owner,
      repo,
      issue_number,
      body
    });

    // Get the ID, title, and GIF URL for the GIF from the response
    const {
      data: { id: gifId, title: gifTitle, images: { original: { url: gifUrl } } }
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
