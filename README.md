<style>
    code {
        background-color: #1e1e1e !important;
        color: #ffffff !important;
        font-family: monospace;
        padding: 2px 6px;
        border-radius: 4px;
    }
</style>

<div style="background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin-bottom: 2px;">
        <h1><strong> IMPORTANT NOTE </strong></h1><br>
        <b>THIS PROJECT WILL NOT WORK WITHOUT THE .ENV FILES!</b> 
        <p>Please see the setup guide below.</p>
    </div>

    <section>
        <p>Sup. Welcome to the project! Here's a quick tutorial to get you started:</p>

        <h3>0. Optional </h3>
        <p>
            I'd recommend downloading 
            <a href="https://www.docker.com/products/docker-desktop/">Docker Desktop</a>. 
            It makes managing each container way easier. You don't need it, buuuuuuut do it.
        </p>

        <h3>1a. Updating an Existing Installation</h3>
        <p>If you have previously cloned the repository and just want to update to the latest version:</p>
        <ul>
            <li>Open the project folder in VS Code using <code>Control + K + O</code>.</li>
            <li>Go to the 'Source Control' section on the left-hand pane (the icon with three circles and lines).</li>
            <li>In the 'GRAPH' section, press the button labelled 'Fetch', then the one labelled 'Pull'.</li>
        </ul>

        <h3>1b. Fresh Installation</h3>
        <p>If you have not previously cloned the repo, do this instead:</p>
        <ul>
            <li>Navigate to wherever you want the project to live on your local machine with <code>Control + K + O</code>.</li>
            <li> run <code> git clone https://github.com/JezzyOweTwo/BarelyNecessary_Backend.git</code>
            </li>
            <li>Use <code>Control + K + O</code> again to move yourself into the project folder.</li>
        </ul>

        <h3>2. Running the Project Locally</h3>
        <p>We're using Docker now, which makes it dead simple to start.</p>
        <ol>
            <b>1. Environment Files:</b> Go to Discord, find the envs, and add them to the root of the project:
            <ul>
                <li><code>.env.development</code></li>
                <li><code>.env.production</code></li>
            </ul>
            
            <b>2a. Developer Setup: </b> If you're tryna change stuff in the project: <br>
            <ul>
                <li><code>docker compose --env-file .env.development -f docker-compose.yml -f docker-compose-dev.yml up </code></li>
                <li><code>npm run dev</code></li>
            </ul>
            
            <b>2b. Production Setup: </b> When we're all done and we need to finally deploy to AWS: <br>
            <ul>
                <li><code>docker compose --env-file .env.production up --build</code> <br></li>
                <li><code>npm run start</code></li>
            </ul>
        </ol>

        <h3>3. Production Notes</h3>
        <p>Note that when we deploy to AWS, all we need to do in code is edit production.env and use step 2b.</p>
    </section>