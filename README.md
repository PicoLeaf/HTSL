# HTSL

My goal is create a HTML-like programming language


Here is an a simple exemple of what it could look like:

```html
<!DOCTYPE htsl>
<html>
    <body>
        <h1>
            <value>"Hello"+" world!"</value>
        </h1>
    
        <debug>"This should show in the console each time the page is loaded!"</debug>

        <if>age > 17<then>
            <h2>You are legally allowed to drive a car. sweet!</h2>
        </if>
    </body>
</html>
```

This project is just a simple htsl server written in NodeJS.

## How to use

NodeJS is requeried to run this server.

1. download the project files
2. open the terminal at the folder of the project files
3. you can use `node src/server` or `npm start` to start the server, also, the server create a config file called config.json, in here you can tweak a few options about the server.
4. You can edit the path to your code in the `path` field in the config.json, any file inside of it can be accessed by anyone visiting the site, for exemple, you can make a file called home.html inside of it which you can acess by going to https://ip:port/home.html
5. Learn about all of the new feature [here](FEATURES.md)

## If you want to dive into my code

if you are curious and want to take a look in my code, well, I highly discourage you to do so!

I don't have the intension to make it into something serious, it is just a hobby.

- My comments are written in a poor english, and should not be used to understand my confusing code, they are cries for help, nothing more.

- While I tried my best to make this thing run the fastest possible Do not use it on a large scale, if I really wanted to, I wouldn't had written it in JavaScript.

- I never wrote a single programming language of my life or even followed a tutorial, so it is strictly forbiden to criticise my code or my way to do stuff, if you want to give me optimisation tips, or directly contribute to this project, it is welcome