## Documentation

### keep in mind that htsl is in developement and most of these feature **will** change

Htsl is for now very bare, and posses very few features, here is a list of them:

While it is only for readability purposes the doctype of the file should be htsl like so:
```html
<!DOCTYPE htsl>
```

You can print out a value with <debug>:
```html
<debug>"Value! Yaaay!"</debug>
```

You can define a variable with <define>:
```html
<define varName>"varContent"</define>
```
the variable is global, meaning that you can fetch data and change it from different pages.

the variable content can be changed again by calling <define> again

You can instantiate system variables by adding the `system` keyword before the name of the variable:
```html
<define system varName>"varContent"</define>
<!-- Warning: once defined a system variable CANNOT be changed, leading to many problems -->
```
You should not define system variable

A variable can be printed using the <debug> html element.

Here is a list of pre-defined system variable:
- NaN, type: number
- true, type: boolean
- false, type: boolean
- null, type: object
- undefined, type: undefined

You can use <if> as a way to test for a boolean value:
```html
<if true>
    <!-- do stuff -->
</if>
```
the <if> element will be subject to change soon

## Config documentation

Whenever the server start it will fetch the config file, and create one in case if it is missing or incorrect
The config file is written in JSON, here are the different fields and their uses:

path: indicates wherever the files are located, by default `./htdocs`

host: the ip to which the server should start at

port: the port to which the server should start at

fileformat: the text format by default `utf-8`
