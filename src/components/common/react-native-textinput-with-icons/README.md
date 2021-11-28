[npm-badge]: https://firebasestorage.googleapis.com/v0/b/packages-785ee.appspot.com/o/react-native-textinput-with-icons.svg?alt=media&token=a900decb-3ea9-4709-9239-50a4567fdb61
[npm-url]: https://www.npmjs.com/package/react-native-textinput-with-icons

# Material Text Input With Icons [![npm][npm-badge]][npm-url]

component for React Native (iOS & Android).

## Usage

```javascript
import React, { Component } from 'react'
import TextInput from 'react-native-textinput-with-icons'

export default class Example extends Component {
  state = {
    name: ''
  }

  render() {
    let { name } = this.state

    return (
      <TextInput
        label="Name"
        // RTL must used when label in arabic ex: label="اللغة العربيه"
        leftIcon="thumbsup"
        leftIconType="oct"
        rippleColor="blue"
        rightIcon="react"
        rightIconType="material"
        value={name}
        refrance={(refrance) => {
            this.input = refrance;
        }}
        onChangeText={name => this.setState({ name })}
      />
    )
  }
}
```

## Supported Icons

[Ionicons](https://ionicons.com/) by Ben Sperry (v4.2.4, 696 icons)\
[Octicons](https://octicons.github.com/)  by Github, Inc. (v8.0.0, 177 icons)\
[Evilicons](http://evil-icons.io/) by Alexander Madyankin & Roman Shamin (v1.10.1, 70 icons)\
[FontAwesome](https://fontawesome.com/icons?from=io) by Dave Gandy (v4.7.0, 675 icons)\
[MaterialCommunityIcons](https://materialdesignicons.com/) by MaterialDesignIcons.com (v2.8.94, 2894 icons)

## Installation

>1- Run `yarn add react-native-textinput-with-icons`
>
>       #OR
>       #npm install --save react-native-textinput-with-icons
>
>2- Run `react-native link react-native-vector-icons`

## Properties

## __`Attention`__

```Text

    You must use RTL prop where label in arabic

```

### Container

name                 | type              | default
:------------------- |:------------------| :------------------
containerWidth       | Number            |  
containerMinWidth    | Number            |  `150`
containerMaxWidth    | Number            |  `screenWidth - '20%'`
containerMaxHeight   | Number            |  `150`
containerMarginBottom| Number            |  `0`

### Label

name                  | type               | default
:-------------------- |:------------------ |:------------------
label                 | String             |
labelDuration         | Number             | `200`
labelColor            | String             | `gray`
labelActiveTop        | Number             | `-18`
labelActiveColor      | String             | `#3f51b5`
labelActiveScale      | Number             | `0.8`

### Placeholder

Name                  | Type               | Default
:-------------------- |:------------------ |:----------
placeholder           | String             |
placeholderColor      | String             | `gray`

### Input

Name                  | Type               | Default
:-------------------- |:------------------ |:----------
minHeight             | Number             |
height                | Number             |
maxHeight             | Number             |
marginTop             | Number             |
marginRight           | Number             |
marginEnd             | Number             |
marginBottom          | Number             | `8`
marginLeft            | Number             |
marginStart           | Number             |
paddingTop            | Number             | `20`
paddingRight          | Number             | `0`
paddingBottom         | Number             | `8`
paddingLeft           | Number             | `0`
color                 | String             | `black`
activeColor           | String             |
fontFamily            | String             |
fontSize              | Number             | `15`
fontWeight            | String or Number   | `normal`
onFocus               | Function
onBlur                | Function
onChangeText          | Function
onContentSizeChange   | Function

### Underline

Name                  | Type               | Default
:-------------------- |:------------------ |:----------
underlineDuration     | Number             | `200`
underlineHeight       | Number             | `1`
underlineColor        | String             | `gray`
underlineActiveColor  | String             | `#3f51b5`
underlineActiveHeight | Number             | `2`

### ErrorHelper

Name                  | Type               | Default
:-------------------- |:------------------ |:----------
error                 | String             |
errorPaddingTop       | Number             | `8`
errorColor            | String             | `#fc1f4a`
errorFontSize         | Number             | `12`

### Icons

Name                  | Type               | Default
:-------------------- |:------------------ |:----------
leftIcon              | String             |
leftIconSize          | Number             | `15`
leftIconColor         | String             | `#777777`
leftIconType          | String             | `ion`
onPressLeftIcon       | Function           |
rightIcon             | String             |
rightIconSize         | Number             | `15`
rightIconColor        | String             | `#777777`
rightIconType         | String             | `ion`
onPressRightIcon      | Function           |
rippleColor           | String             | `rgba(220,220,220,10)`

### Icon Types

Name                  | Type               | iconLibrary
:-------------------- |:------------------ |:----------
ion                   | String             | IonIcons
oct                   | String             | Octicons
evil                  | String             | Evilicons
awesome               | String             | FontAwesome
material              | String             | MaterialCommunityIcons

Other [TextInput](https://facebook.github.io/react-native/docs/textinput.html#props) properties will also work

```Text
## License

The MIT License.

See [LICENSE](LICENSE)
```