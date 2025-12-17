For the e2e tests, I want the following:

1. I want to define the e2e tests for different flows or user journeys.
2. We need to decouple the tests from the api or mock data.
3. We should be able to run the tests with the real api.
4. We should have an option to store all the api calls to snapshot files and use them for mocking the api. We can use this strategy to create the files or update them, but this command should be run manually.
5. We should use the mock api to run the tests in the ci or locally for faster execution.
6. We should update the snapshot files when the api changes.

There are a few ways of providing the data:

1. Use the api to get the data.
2. Use the snapshot files to get the data.
3. Use the mock to get specific data for the test.

We need simple mechanisms to switch between the different ways, run them in parallel and make it easy to update the snapshot or create the mock data.

First, transform this requirements into a clear, short, concise specification that addresses this problem. Make sure you start with the problem statement, key decisions and then the requirements.
