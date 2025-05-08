# CAB432 Assignment 1
The purpose of this assignment was to create a web application that took the responses from two APIs and collated them in a way to provide additional functionality to a potential user, this program needed to be built into a docker image for deployment on AWS.
Most of this README has been reworded from the report that was completed alongside this assignment.

The APIs chosen for this task were:
- [Twitch](https://dev.twitch.tv/docs/api/)
- [IGDB](https://api-docs.igdb.com/)

## Purpose
The website was designed to help users better inform themselves as to whether they will enjoy a given game by providing them with a list of games similar to the one they've searched for,
while providing a current live stream for each game to allow them to gauge whether it fits their preferences. 
Additionally, it serves as a tool for streamers, allowing them to find games similar to what they currently stream the most, and is therefore best suited for their current audience.

The site allows for viewing data by providing either the title of a game, or the username of a Twitch account.
In the case of the latter, the site displays data about the user and analyses their stream history to get an idea of what their most popular game is.
This is what is used to provide a list of similar games that may be suited for their audience

## Architecture and Data Flow
### Architecture
The applicaiton was developed using Express.js, rendering pages with the handlebars view engine and styled with TailwindCSS.
When it receives a request, the server performs the relevant requests to the first API, using what was received from one to inform the requests to the other APIs.
This data is processed along the way to ensure that value can be added to what is shown the user and make rendering the page easier. 
Once all the data has been recieved and processed, it is passed off to the view engine to populate the page with the information.

As most of the processing is done on the server, there is very little that needs to be done on the client side other than displaying the twitch stream embeds.

### Data Flow
The image below shows the way in which data flows through the system when accessing the /game endpoint with a valid gameID. This is similar to how data flows when accessing the other available endpoints.

![image](https://github.com/user-attachments/assets/750c8378-e928-437d-b927-c6f36a67bdbd)

## Docker Deployment
The application was successfully built into a docker container and deployed onto an EC2 instance by utilising a [docker-compose file](/docker-compose.yml). The full dockerfile can be found [here](/dockerfile)
The build utilises the node:20 base image (The latest version when this project was being developed), which provides a pre-configured environment for running node.js projects. We then copy over the package.json file and install the required packages before copying over the rest of the project files.

Since TailwindCSS was utilized as the style library, it was necessary to include the following line in our dockerfile before we start the server:

```RUN npm run build:css```

This runs the build command defined in the [package.json](/package.json) file and ensures that the CSS styles are up to date with what is used within the web page in the event that the styles weren't rebuilt before use.

## Known bugs and issues
1. Loading favicons of social media websites for a given game is blocked when using Firefox private browsing, or when using certain adblockers (See image).

![image](https://github.com/user-attachments/assets/ae87724d-6f2e-48d3-a851-2884e75dae7a)

2. If a release date is in the future, it results in ‘invalid date’

## Implementation notes
This application uses the [axios library](https://axios-http.com/), since node.js lacked the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) when this was developed.
