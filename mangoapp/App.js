let AppVersionNumber = "v. 1.8.26.3 beta";

/* APP META-DATA, AUTHORSHIP, AND OTHER STUFF
**
** The following text, as well as the script, visual styles and functionality
** contained therein are intended for the exclusive use of the manGo team.
** If not applicable, you are by no means allowed to:
** -- modify
** -- distribute
** -- duplicate
** or make use of it in any other way.
**
** HOW TO READ THIS DOCUMENT
**
**
** VERSION 2.0
** This is v.2.0 of manGo app (this script makes no reference nor does
** it contain any method, data or code from the previous verion)
** manGo v.1.0 source code is available at github.
**
** TECHNOLOGIES
** This app is written in React Native with backend in Google Firebase.
** This script compiles to an expoKit app (has not, and should not be detached)
** The code from this script is fetched OTA to ensure updates and consistency.
**
** VERSION CONTROL
** This script began its writing on May 29, 2018
** Latest stable verion v.1.7.12.10 june 13, 2018
** Latest stable version v.1.7.15.10 june 14, 2018
** Latest stable version v.1.7.20.1 june 15, 2018
** Latest stable version v.1.8.15.1 june 20, 2018
** Latest stable version v.1.8.20.6 june 26, 2018
** === FIRST INSIDER BETA scheduled june 27, 2018
**
**  ROADMAP
** -- * NEW NOTIFICATION ELEMENT (FOR INTEGRATION WITH CHAT HEADER AND PUSH NOTIFICATIONS)
** -- ADD DESCRIPTION TEXT (OPTIONAL) TO ElementsTaskListItem
** -- VIEW CART AND CHECKOUT
** -- * DISPLAY MAP ON ScreenExplore
** -- DISPLAY CATEGORIES OPTION ON ScreenExplore
**
** VERSION NUMBERS
** For debugging, building and consistency purposes, the first line should
** always contain the version number the script corresponds to.
** The first number refers to the latest stable public build. Changing it is an administrative decision.
** The second number refers to the amount of components/functionality finished. Do not add a number until finished.
** The third number refers to the progress made on such component/functionality.
** A fourth number may be added for debugging purposes.
**
** AUTHOR Eduardo Villalpando
** Developed for manGo (2018)
**
*/






/* ==== IMPORT PACKAGES ==== */

/* -- REACT, EXPO, REACT NAVIGATION */
import React from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, KeyboardAvoidingView, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { ImagePicker, Permissions, Location, MapView, BlurView, LinearGradient, Notifications} from 'expo';
import {Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome, Entypo} from '@expo/vector-icons';
import {StackNavigator, TabNavigator} from 'react-navigation';
/* -- FIREBASE (AND FIREBASE FIRESTORE) */
import * as firebase from 'firebase';
require("firebase/firestore");

/* ==== IMPORT PACKAGES end ==== */

/* ============================= */
/* ==== GLOBAL VARIABLES ==== */

let arrayTasksData = [];
let arrayCategoriesData = [];
let objCurrentUserData = {};

/* ==== GLOBAL VARIABLES end ==== */

/* ============================== */
/* ==== UTILITIES ==== */

/* -- NOTIFICATIONS */
export class UtilitiesNotifications {

}

/* -- TASKS */
export class UtilitiesTask {
	static userApply( dataTask, uidWorker ){
		if( !objCurrentUserData.data.JOB_CATEGORIES.some((item) => item['NAME'] == dataTask.data.CATEGORY) ){
			alert('Necesitas un perfil de '+dataTask.data.CATEGORY+' para realizar este trabajo');
		} else {
			dataTask.data.USERS.push({
				'UID': uidWorker,
				'ROLE': 'INTERESTED'
			});
			firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
				USERS: dataTask.data.USERS,
				LAST_UPDATE: new Date(),
			});
			thisApp.forceUpdate();
		}
	}

	static userApplyCancel( dataTask, uidWorker ){
		let usersArrayIndex = dataTask.data.USERS.findIndex((item) => item.UID == uidWorker);
		dataTask.data.USERS.splice(usersArrayIndex, 1);
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			USERS: dataTask.data.USERS,
			LAST_UPDATE: new Date(),
		});
		thisApp.forceUpdate();
	}

	static userHire( dataTask, uidWorker ){
		dataTask.data.USERS.find((item) => item['UID'] == uidWorker)['ROLE'] = 'WORKER';
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			USERS: dataTask.data.USERS,
			STATUS: 'ASIGNED',
			LAST_UPDATE: new Date(),
		}).then(()=>{
			alert('Hired')
		});
		thisApp.forceUpdate();
	}

	static userAcceptTask( dataTask, uidWorker ){
		dataTask.data.CONTENT.push({
			'CONTENT': 'ACTIVE',
			'TYPE': 'INFO',
			'DATE': new Date(),
			'USER': uidWorker
		});
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			STATUS: 'ACTIVE',
			LAST_UPDATE: new Date(),
			CONTENT: dataTask.data.CONTENT,
		});
		thisApp.forceUpdate();
	}

	static userDeclineTask ( dataTask, uidWorker ){
		dataTask.data.USERS.find((item) => item['UID'] == uidWorker)['ROLE'] = 'INTERESTED';
		dataTask.data.CONTENT.push({
			'CONTENT': 'CANCELLED_WORKER',
			'TYPE': 'INFO',
			'DATE': new Date(),
			'USER': uidWorker,
		})
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			USERS: dataTask.data.USERS,
			STATUS: 'UNASIGNED',
			LAST_UPDATE: new Date(),
			CONTENT: dataTask.data.CONTENT,
		});
		thisApp.forceUpdate();
	}

	static clientDeclineTask( dataTask ){
		dataTask.data.USERS.find((item) => item['ROLE'] == 'WORKER')['ROLE'] = 'INTERESTED';
		dataTask.data.CONTENT.push({
			'CONTENT': 'CANCELLED_CLIENT',
			'TYPE': 'INFO',
			'DATE': new Date(),
			'USER': firebase.auth().currentUser.uid
		})
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			USERS: dataTask.data.USERS,
			STATUS: 'UNASIGNED',
			LAST_UPDATE: new Date(),
			CONTENT: dataTask.data.CONTENT,
		});
		thisApp.forceUpdate();
	}

	static addToTask( dataTask , objContent ){
		dataTask.data.CONTENT.push( objContent );
		firebase.firestore().collection('TASKS').doc(dataTask.ID).update({
			CONTENT: dataTask.data.CONTENT,
			LAST_UPDATE: new Date()
		});
		thisApp.forceUpdate();
	}

	static removeTask( dataTask ){
		firebase.firestore().collection('TASKS').doc(dataTask.ID).delete();
	}

}
/* -- PRICE */
export class UtilitiesPrice {
	static getPriceValue(newValue){
		var priceNumber = parseFloat(newValue.replace(/[^\d\.]/, ''));
		var result = '';
		if(Number.isNaN(priceNumber)){
			result = '$'+0;
		} else {
			result = '$'+priceNumber;
		}
		return result;
	}
}
/* -- LOCATION (deprecated)*/
export class UtilitiesReturnLocation extends React.Component {
  state={ locationResult: null, addressResult: null}
  async componentWillMount(){
    const {status} = await Permissions.askAsync(Permissions.LOCATION);
    Location.getCurrentPositionAsync().then((location)=>{
      this.setState({locationResult: location.coords});
    });
    Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude}).then((address)=>{
      //this.setState({addressResult: address});
      this.setState({ addressResult:  address[0].name + ', '  + address[0].city + ' ' + address[0].postalCode + ' ' + address[0].region });
    })
  }
  render(){
    if(this.props.type == 'coords'){
      return JSON.stringify(this.state.locationResult);
    } else if (this.props.type == 'address'){
      return this.state.addressResult;
    }
  }
}

/* ==== UTILITIES end ==== */

/* ======================= */
/* ==== UI ELEMENTS ==== */
//! EXPORT TO DIFFERENT FILE

/* UI ELEMENTS / INPUTS */
/* -- TOOLBAR HEADER*/
export class ElementsHeaderToolbar extends React.Component {
  render(){
    return(
      <View style={{borderBottomColor: 'rgba(160,160,160,0.2)', borderBottomWidth: 1, backgroundColor: 'white', padding: 16, paddingTop: 0, paddingBottom: 0}}>
      {this.props.children}
      </View>
    )
  }
}
/* -- INPUT WITH NAME*/
export class ElementsInputName extends React.Component{
  state={value: null}

  renderConditionalName(){
    if(this.state.value && this.props.flyOutTitle != false){
      return(
        <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: 4, marginBottom: 2}}>
          <Text style={{fontWeight: '600'}}>{this.props.name}</Text>
          <Text>{this.props.isError ? this.props.isErrorMessage : ''}</Text>
        </View>
      )
    }
  }
  returnConditionalStyleValue(){
    if(this.state.value){
      return {borderColor: 'rgba(160,160,160,0.4)', borderWidth: 1, backgroundColor: 'white'};
    } else {
      return {backgroundColor: 'rgba(200,200,200,0.4)'};
    }
  }
  returnConditionalStylePadding(){
    if(this.props.compact){
      return {paddingTop: 8, paddingBottom: 8};
    }
  }

  render(){
    return(
      <View style={{margin: 4}}>
        {this.renderConditionalName()}
        <View style={[{borderRadius: 8, margin: 4}, this.props.style, {flexDirection: 'row', alignItems: 'center', padding: 14, margin: 4}, this.returnConditionalStyleValue(), this.returnConditionalStylePadding()]}>
          <TextInput placeholder={this.props.name} value={this.props.value} style={{padding: 0, margin: 2, fontSize: 16, flexGrow: 1}} onChangeText={(newText)=>{
            this.setState({value: newText});
            this.props.onChangeText(newText);
          }} onSubmitEditing={this.props.onSubmitEditing}></TextInput>
          {this.props.children}
        </View>
      </View>
    )
  }
}
/*-- INPUT BUTTON*/
export class ElementsInputButton extends React.Component{
	returnConditionalPadding(){
		if(this.props.compact != true){
			return {padding: 16}
		} else {
			return {padding: 8}
		}
	}
  returnConditionalStyle(){
    switch (this.props.type) {
      case 'fill':
        return {backgroundColor: this.props.buttonColor}
        break;
      case 'outline':
        return {borderWidth: 1, borderColor: this.props.buttonColor}
        break;
      case 'inline':
        return {}
        break;
      case 'disabled':
        return {backgroundColor: 'rgba(160,160,160,0.4)'}
				break;
			default:
				return {backgroundColor: this.props.buttonColor}
				break;
    }
  }
	returnConditionalStyleTitle(){
		if(this.props.textColor){
			return {color: this.props.textColor}
		} else {
			return {color: 'black'}
		}
	}

  render(){
    return(
      <TouchableOpacity style={[ this.props.style, this.returnConditionalPadding(), {fontSize: 16, margin: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, this.returnConditionalStyle()]} onPress={this.props.onPress}>
        <Text style={[this.returnConditionalStyleTitle(), {fontSize: 16}]}>{this.props.title}</Text>
      </TouchableOpacity>
    )
  }
}
/*-- INPUT IMAGE*/
export class ElementsInputImage extends React.Component{
  state={resultImageUri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/user_male2-256.png'}
  async pickImage(){
    const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    let resultImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1,1]
    })
    if(!resultImage.cancelled){
      this.setState({resultImageUri: resultImage.uri})
    }
		this.props.onPickImage(resultImage);
  }

  render(){
    return(
      <TouchableOpacity style={{padding: 12, fontSize: 16, margin: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(160,160,160,0.2)'}} onPress={()=>{this.pickImage()}}>
        <Image style={{height: 56, width: 56, borderRadius: 28, margin: 4, backgroundColor: 'black'}} source={{uri: this.state.resultImageUri}}></Image>
        <Text style={{fontSize: 16, margin: 4}}>FOTO DE PERFIL</Text>
      </TouchableOpacity>
    )
  }
}
/*-- INPUT TEXTAREA */
export class ElementsInputTextarea extends React.Component {
	returnFontSize(){
		if(this.props.fontSize){
			return {fontSize: this.props.fontSize}
		} else {
			return {fontSize: 24}
		}
	}
	returnConditionalStyleCard(){
		if(this.props.type == 'card'){
			return {backgroundColor: 'white', borderWidth: 1, borderColor: 'rgba(160,160,160,0.2)', borderRadius: 8, padding: 8}
		} else {
		}
	}
  render(){
    return(
			<View style={this.returnConditionalStyleCard()}>
				<TextInput value={this.props.value} style={[this.returnFontSize(), {padding: 8, fontWeight: '600'}]} placeholder={this.props.placeholder} blurOnSubmit={false} multiline={true} onChangeText={(newText)=>{
					this.props.onChangeText(newText);
				}}></TextInput>
			</View>
    )
  }
}
/*-- INPUT LOCATION*/
export class ElementsInputLocation extends React.Component {
  state={
    value: null,
    isFocused: false,
    location: null
  }

  returnConditionalStyleFocus(){
    if(this.state.isFocused){
      return {backgroundColor: 'rgba(200,200,200,0.4)'};
    }
  }

  returnConditionalStyleValue(){
    if(this.state.value){
      return {borderColor: 'rgba(160,160,160,0.4)', borderWidth: 1, backgroundColor: 'white'};
    } else {
      return {backgroundColor: 'rgba(200,200,200,0.4)'};
    }
  }
  returnConditionalStylePadding(){
    if(this.props.compact){
      return {paddingTop: 8, paddingBottom: 8};
    }
  }

  renderConditionalName(){
    if(this.state.value && this.props.flyOutTitle != false){
      return(
        <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: 4, marginBottom: 2}}>
          <Text style={{fontWeight: '600'}}>{this.props.name}</Text>
          <Text>{this.props.isError ? this.props.isErrorMessage : ''}</Text>
        </View>
      )
    }
  }

  renderConditionalMap(){
    if(this.state.isFocused){
      return <View style={{borderRadius: 8, margin: 4, height: 160}}>
			<MapView style={{height: 160}}
				region={{
					latitude: this.state.locationResult.latitude,
					longitude: this.state.locationResult.longitude,
					latitudeDelta: 0.002,
					longitudeDelta: 0.002,
				}}
			>
				<MapView.Marker coordinate={{latitude: this.state.locationResult.latitude, longitude: this.state.locationResult.longitude}} />
			</MapView>
			</View>
    }
  }

  async getCurrentLocation(){
		const {status} = await Permissions.askAsync(Permissions.LOCATION);
    Location.getCurrentPositionAsync().then((location)=>{
      this.setState({locationResult: location.coords});
      Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude}).then((address)=>{
        this.setState({ value:  address[0].name + ', '  + address[0].city + ' ' + address[0].postalCode + ' ' + address[0].region });
				this.props.onChangeLocation({
					coords: {
						latitude: this.state.locationResult.latitude,
						longitude: this.state.locationResult.longitude,
					},
					address: this.state.value,
				})
      })
    })
  }

	async getCustomLocationCoords(initialLocationCoords){
      this.setState({locationResult: initialLocationCoords});
      Location.reverseGeocodeAsync({latitude: initialLocationCoords.latitude, longitude: initialLocationCoords.longitude}).then((address)=>{
        this.setState({ value:  address[0].name + ', '  + address[0].city + ' ' + address[0].postalCode + ' ' + address[0].region });
				this.props.onChangeLocation({
					coords: {
						latitude: initialLocationCoords.latitude,
						longitude: initialLocationCoords.longitude,
					},
					address: this.state.value,
				})
      })
  }


  async getCustomLocationAddress( address ){
    Location.geocodeAsync(address).then((location)=>{
      this.setState({ locationResult: location[0] });
			this.props.onChangeLocation({
				coords: {
					latitude: this.state.locationResult.latitude,
					longitude: this.state.locationResult.longitude,
				},
				address: this.state.value,
			})
    });

  }

  componentWillMount(){
		if(!this.props.initialLocationCoords){
			this.getCurrentLocation()
		} else {
			this.getCustomLocationCoords(this.props.initialLocationCoords)
		}
  }

  render(){
    return(

      <View style={[{margin: 4, borderRadius: 8}, this.returnConditionalStyleFocus()]}>
      {this.renderConditionalName()}
      {this.renderConditionalMap()}
        <View style={[{flexDirection: 'row', alignItems: 'center', padding: 14, margin: 4, borderRadius: 8, flex: 1}, this.returnConditionalStyleValue(), this.returnConditionalStylePadding()]}>
          <TextInput  multiline={true} placeholder={this.props.name} value={this.state.value} style={{margin: 2, fontSize: 16, flexGrow: 1}}
            onFocus={()=>{ this.setState({isFocused: true}) }}
            onBlur={()=>{ this.setState({isFocused: false}) }}
            onChangeText={(newText)=>{
              this.setState({value: newText});
            }}
            onSubmitEditing={()=>{
              this.getCustomLocationAddress(this.state.value)
            }}
          ></TextInput>
          <TouchableOpacity style={{margin: 2}} onPress={()=>{this.getCurrentLocation()}}>
            <FontAwesome name='location-arrow' size={24} color='rgb(0,122,255)'></FontAwesome>
          </TouchableOpacity>
        </View>
      </View>

    )
  }
}
/*-- INPUT FULLSCREEN RADIO*/
export class ElementsInputRadioFullscreen extends React.Component {
  selectedIndex = null;
  renderConditional(){
    if(this.selectedIndex == null){
      return(
        <View style={{borderRadius: 8, backgroundColor: 'white'}}>
          <Text style={{fontSize: 24, fontWeight: '800', margin: 8, marginTop: 4, marginBottom: 4}}>{this.props.title}</Text>
        {
          this.props.data.map((l,i)=>{
            return(
              <TouchableOpacity style={{margin: 0, padding: 4, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)'}} onPress={()=>{
                this.selectedIndex = i;
                this.props.onSelect(l);
                this.forceUpdate();
              }}
              >
                {this.props.optionChildren(l)}
              </TouchableOpacity>
              )
          })
        }
        </View>
      )
    } else {
      return(
        <TouchableOpacity style={{margin: 8, marginTop: 2, marginBottom: 2, padding: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgb(160,160,160)', backgroundColor: 'white'}} onPress={()=>{
          this.selectedIndex = null;
          this.props.onSelect(null);
          this.forceUpdate();
        }}>
          <Text style={{fontSize: 16, fontWeight: '800', margin: 8, marginTop: 2, marginBottom: 2}}>{this.props.title}</Text>
          {this.props.selectedChildren(this.props.data[this.selectedIndex])}
        </TouchableOpacity>
      )
    }
  }
  render(){
    return this.renderConditional();
  }
}
/*-- INPUT SELECT LIST*/
export class ElementsInputSelectList extends React.Component{
	selectListData = [];
  selectedElements = [];
  selectElement(element, isSelected){
    if(isSelected){
      this.selectedElements.splice(this.selectedElements.indexOf(element), 1);
    } else {
      this.selectedElements.push(element)
    }
  }

	componentWillMount(){
		/*if(this.props.data.length < 0){
			this.selectListData = ['empty']
		} else {
			this.selectListData = this.props.data
		}
		this.forceUpdate();¨*/
	}

  render(){
    return this.props.data.map((l,i)=>{
      if(this.selectedElements.includes(l)){
        return(
          <TouchableOpacity style={{margin: 0, padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)'}} onPress={()=>{
            this.selectElement(l, true);
            this.props.onChangeSelection(l);
            this.forceUpdate();
          }}
          >
            <MaterialIcons name='check-box' size={24} color='rgb(0,122,255)' style={{margin: 8}}></MaterialIcons>
            {this.props.optionChildren(l, true)}
          </TouchableOpacity>
        )
      } else {
        return(
          <TouchableOpacity style={{margin: 0, padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)'}} onPress={()=>{
            this.selectElement(l, false)
            this.props.onChangeSelection(l);
            this.forceUpdate();
          }}
          >
            <MaterialIcons name='check-box-outline-blank' size={24} color='rgb(0,122,255)' style={{margin: 8}}></MaterialIcons>
            {this.props.optionChildren(l, false)}
          </TouchableOpacity>
        )
      }
    })
  }
}
/* -- INPUT TOGGLE */


/* UI ELEMENTS / USERS */
/* -- LIST TIEM USER */
export class ElementsProfileListItem extends React.Component{
	username = '';
	name = '';
	uid = '';
	profileURL = '';

	returnConditionalStyleBorder(){
		if(this.props.showBorder != false){
			return {borderBottomColor: 'rgba(160,160,160,0.2)', borderBottomWidth: 1,}
		} else {
			return {}
		}
	}

	returnConditionalStyleCard(){
		if(this.props.type != 'card'){
			return [this.returnConditionalStyleBorder(), {padding: 0}]
		} else {
			return {borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, borderRadius: 8, backgroundColor: 'white', margin: 8}
		}
	}

	async componentWillReceiveProps(){
		this.username = await this.props.dataUser.data.USERNAME;
		this.name = await this.props.dataUser.data.NAME;
		this.uid = await this.props.dataUser.ID;
		firebase.storage().ref().child('PROFILE_PICS/'+this.uid).getDownloadURL().then((url)=>{
			this.profileURL = url;
			this.forceUpdate();
		}).catch(()=>{
			this.profileURL = '';
			this.forceUpdate();
		})
		this.forceUpdate();
	}

	async componentWillMount(){
		this.username = await this.props.dataUser.data.USERNAME;
		this.name = await this.props.dataUser.data.NAME;
		this.uid = await this.props.dataUser.ID;
		firebase.storage().ref().child('PROFILE_PICS/'+this.uid).getDownloadURL().then((url)=>{
			this.profileURL = url;
			this.forceUpdate();
		}).catch(()=>{
			this.profileURL = '';
			this.forceUpdate();
		})
		this.forceUpdate();
	}
	/*props dataUser*/
	render(){
		return(
			<TouchableOpacity style={[this.returnConditionalStyleCard(), {flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8}]} onPress={this.props.onPress}>
				<View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 1, padding: 4}}>
					<Image style={{height: 40, width: 40, borderRadius: 20, margin: 4, backgroundColor: 'black'}} source={{uri: this.profileURL}}></Image>
					<View style={{margin: 4}}>
						<Text style={{fontSize: 18, fontWeight: '600'}}>{this.name}</Text>
						<Text style={{fontSize: 12}}>{'@'+this.username}</Text>
					</View>
				</View>
				{this.props.children}
			</TouchableOpacity>
		)
	}
}
/* -- CARD USER */
export class ElementsProfileCard extends React.Component{
	username = '';
	name = '';
	jobCount = 0;
	rating = 0;
	bio = '';
	uid = '';
	profileURL = '';

	async componentWillMount(){
		this.username = await this.props.dataUser.data.USERNAME;
		this.name = await this.props.dataUser.data.NAME;
		this.jobCount = await this.props.dataUser.data.JOB_COUNT;
		this.rating = await this.props.dataUser.data.RATING;
		this.bio = await this.props.dataUser.data.BIO;
		this.uid = await this.props.dataUser.ID;
		firebase.storage().ref().child('PROFILE_PICS/'+this.uid).getDownloadURL().then((url)=>{
			this.profileURL = url;
			this.forceUpdate();
		}).catch(()=>{
			this.profileURL = '';
			this.forceUpdate();
		})
		this.forceUpdate();
	}
	returnConditionalStyleCard(){
		if(this.props.type == 'card'){
			return {backgroundColor: 'white', borderWidth: 1, borderColor: 'rgba(160,160,160,0.2)', borderRadius: 8}
		} else {
			return {}
		}
	}
	render(){
		return (
			<View style={[this.returnConditionalStyleCard(), {margin: 8}]}>
				<View style={{padding: 8, flexDirection: 'row', alignItems: 'center', paddingTop: 4, paddingBottom: 4}}>
					<Image style={{height: 64, width: 64, borderRadius: 32, margin: 8, backgroundColor: 'black'}} source={{uri: this.profileURL}}></Image>
					<View style={{margin: 8}}>
						<Text style={{fontSize: 24, fontWeight: '600'}}>{this.name}</Text>
						<Text style={{fontSize: 16}}>{'@'+this.username}</Text>
					</View>
				</View>

				<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)'}}>
					<Text style={{margin: 8, fontSize: 16}}>{this.bio}</Text>
				</View>


				<View style={{padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)', paddingTop: 8, paddingBottom: 8}}>
					<View style={{flexGrow: 1}}>
						<Text style={{fontSize: 24, textAlign: 'center'}}>{this.rating}</Text>
						<Text style={{fontSize: 12, textAlign: 'center'}}> VALORACIONES </Text>
					</View>
					<View style={{flexGrow: 1}}>
						<Text style={{fontSize: 24, textAlign: 'center'}}>{this.jobCount}</Text>
						<Text style={{fontSize: 12, textAlign: 'center'}}> TRABAJOS </Text>
					</View>
				</View>

			</View>
		)
	}
}
/* -- CARD USER CATEGORY */
export class ElementsProfileCardCategory extends React.Component{
	category = '';
	categoryDescription = '';
	categoryIconName = '';
	categoryIconCollection = '';
	categoryServices = [];
	async componentWillMount(){
		this.category = await this.props.dataCategory.NAME;
		this.categoryDescription = await this.props.dataCategory.DESCRIPTION;
		this.categoryServices = await this.props.dataCategory.SERVICES;

		let categoryObj = await arrayCategoriesData.find((item) => item.ID == this.category )
		this.categoryIconCollection = await categoryObj.data['COLLECTION'];
		this.categoryIconName = await categoryObj.data['ICON'];

		/*firebase.firestore().collection('CATEGORIES').doc(this.category).onSnapshot((doc)=>{
			this.categoryIconCollection = doc.data()['COLLECTION'];
			this.categoryIconName = doc.data()['ICON'];
			this.forceUpdate();
		})*/
		this.forceUpdate();
	}
	returnConditionalStyleCard(){
		if(this.props.type == 'card'){
			return {margin: 8, borderWidth: 1, borderColor: 'rgba(160,160,160,0.2)', borderRadius: 8, backgroundColor: 'white'}
		} else {
			return {padding: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)'}
		}
	}
	renderConditionalServices(){
		if(this.props.descriptionOnly != true){
			return this.categoryServices.map((l,i)=>{
				return(
					<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, borderBottomColor: 'rgba(160,160,160,0.2)', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
						<Text style={{fontSize: 16, margin: 8, fontWeight: '600'}}>{l.TITLE}</Text>
						<Text style={{fontSize: 12, margin: 8}}>{'$'+l.PRICE}</Text>
					</View>
				)
			})
		}
	}
	render(){
		return(
			<TouchableOpacity style={this.returnConditionalStyleCard()} onPress={this.props.onPress}>
				<View style={{padding: 8, paddingTop: 4, paddingBottom: 2, flexDirection: 'row', alignItems: 'center'}}>
					<View style={{margin: 4}}>{ContainerCategories.returnCategoryIcon(this.categoryIconCollection, this.categoryIconName)}</View>
					<Text style={{fontSize: 20, fontWeight: '600', margin: 8}}>{this.category}</Text>
				</View>
				<View style={{padding: 8, paddingTop: 2, paddingBottom: 4}}>
					<Text style={{fontSize: 16, margin: 8}}>{this.categoryDescription}</Text>
				</View>
				{this.renderConditionalServices()}
			</TouchableOpacity>
		)
	}
}


/* UI ELEMENTS / TASKS */
/* -- TASK CARD */
export class ElementsTaskDetails extends React.Component{
	userClientObj = {'ID': null, 'data': null};
	userWorkerObj = {'ID': null, 'data': null};
	renderConditionalWorker(){
		if(this.props.dataTask.data.STATUS != 'UNASIGNED'){
			return <ElementsProfileListItem dataUser={this.userWorkerObj} showBorder={false} ><MaterialCommunityIcons name='worker' color='rgb(160,160,160)' size={24} style={{margin: 4}}/></ElementsProfileListItem>
		}
	}
	componentWillMount(){
		let uidClient = this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'CLIENT')['UID'];
		firebase.firestore().collection('USERS').doc(uidClient).get().then((doc)=>{
			this.userClientObj['ID'] = doc.id;
			this.userClientObj['data'] = doc.data();
			this.forceUpdate();
		});
		if(this.props.dataTask.data.STATUS != 'UNASIGNED'){
			let uidWorker = this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'WORKER')['UID'];
			firebase.firestore().collection('USERS').doc(uidWorker).get().then((doc)=>{
				this.userWorkerObj['ID'] = doc.id;
				this.userWorkerObj['data'] = doc.data();
				this.forceUpdate();
			})
		}

		this.forceUpdate()
	}
	render(){
		return(
			<View style={{margin: 8, borderWidth: 1, borderColor: 'rgba(160,160,160,0.2)', borderRadius: 8}}>
				<View style={{padding: 8, paddingTop: 0, paddingBottom: 0}}>
					<ElementsProfileListItem dataUser={this.userClientObj} showBorder={false}>
						<MaterialCommunityIcons name='security-home' color='rgb(76,217,100)' size={24} style={{margin: 4}}/>
					</ElementsProfileListItem>
				</View>
				<MapView region={{
					latitude: this.props.dataTask.data.LOCATION._lat,
					longitude: this.props.dataTask.data.LOCATION._long,
					latitudeDelta: 0.002,
					longitudeDelta: 0.002,
				}} style={{ height: 160 }} cacheEnabled>
					<MapView.Marker coordinate={{latitude: this.props.dataTask.data.LOCATION._lat, longitude: this.props.dataTask.data.LOCATION._long}} />
				</MapView>
				<View style={{padding: 8, paddingTop: 0, paddingBottom: 0}}>
					<ElementsTaskListItem dataTask={this.props.dataTask}></ElementsTaskListItem>
					{this.renderConditionalWorker()}
				</View>
			</View>
		)
	}
}
/* -- TASK NOTIFICATION LIST ITEM */
export class DEPRECATEDElementsNotificationListItem extends React.Component{
	//! CHANGE NAME
	notificationTitle = '';
	notificationSubtitle = '';
	objCategoryIcon = {};
	returnConditionalTitle(){
		if(this.props.dataTask.data.STATUS == 'UNASIGNED'){
			//UNASINGED
			this.notificationTitle = 'Nueva tarea de '+this.props.dataTask.data.CATEGORY;
		} else if (this.props.dataTask.data.STATUS == 'ASIGNED'){
			//ASIGNED
			if(this.props.dataTask.userRole == 'CLIENT'){
				let uidWorker = this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'WORKER')['UID'];
				firebase.firestore().collection('USERS').doc(uidWorker).get().then((doc)=>{
					this.notificationTitle = doc.data()['NAME'];
					this.forceUpdate();
				})
			} else {
				this.notificationTitle = 'Nueva tarea de '+this.props.dataTask.data.CATEGORY;
			}
		} else if (this.props.dataTask.data.STATUS == 'ACTIVE'){
			//ACTIVE
			this.objCategoryIcon = arrayCategoriesData.find((item) => item['ID'] == this.props.dataTask.data.CATEGORY );
			if(this.props.dataTask.userRole == 'CLIENT'){
				let uidWorker = this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'WORKER')['UID'];
				firebase.firestore().collection('USERS').doc(uidWorker).get().then((doc)=>{
					this.notificationTitle = doc.data()['NAME'];
					this.forceUpdate();
				})
			} else if (this.props.dataTask.userRole == 'WORKER'){
				let uidClient = this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'CLIENT')['UID'];
				firebase.firestore().collection('USERS').doc(uidClient).get().then((doc)=>{
					this.notificationTitle = doc.data()['NAME'];
					this.forceUpdate();
				})
			} else {
				this.notificationTitle = 'Nueva tarea de '+this.props.dataTask.data.CATEGORY;
			}
			//CLIENT
			//WORKER
			//INTERESTED - PUBLIC
		}
		this.forceUpdate();
	}
	returnConditionalSubtitle(){
		if(this.props.dataTask.data.STATUS == 'UNASIGNED'){
			if(this.props.dataTask.userRole == 'CLIENT'){
				this.notificationSubtitle = 'Publicaste una tarea';
			} else if (this.props.dataTask.userRole == 'INTERESTED'){
				this.notificationSubtitle = 'Te suscribiste a una tarea';
			}
			else {
				this.notificationSubtitle = 'Información no disponible';
			}
		} else if (this.props.dataTask.data.STATUS == 'ASIGNED'){
			if(this.props.dataTask.userRole == 'CLIENT'){
				this.notificationSubtitle = 'Asingaste un trabajador';
			} else if (this.props.dataTask.userRole = 'WORKER'){
				this.notificationSubtitle = 'Fuiste asignado';
			} else {
				this.notificationSubtitle = 'Un trabajador ya fue seleccionado';
			}

		} else if (this.props.dataTask.data.STATUS == 'ACTIVE'){
			this.notificationSubtitle = 'Último mensaje'
		}
		this.forceUpdate();
	}
	renderConditionalIcon(){
		if(this.props.dataTask.data.STATUS == 'UNASIGNED'){
			let categoryObj = arrayCategoriesData.find((item) =>  item.ID == this.props.dataTask.data.CATEGORY );
			return <View style={{height: 48, width: 48, borderRadius: 8, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} > ContainerCategories.returnCategoryIcon(categoryObj.data.ICON, categoryObj.data.COLLECTION, 'white') </View>
		} else if (this.props.dataTask.data.STATUS == 'ASIGNED' || this.props.dataTask.data.STATUS == 'ACTIVE'){

			return <View style={{height: 48, width: 48, borderRadius: 24, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} > ContainerCategories.returnCategoryIcon(categoryObj.data.ICON, categoryObj.data.COLLECTION, 'white') </View>
		}
	}
	componentWillReceiveProps(){
		this.forceUpdate();
	}
	componentWillMount(){
		this.returnConditionalTitle();
		this.returnConditionalSubtitle();
	}
	render(){
		return(
			<TouchableOpacity onPress={this.props.onPress} style={{padding: 4, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)', paddingTop: 8, paddingBottom: 8}}>
				{this.renderConditionalIcon()}
				<View style={{margin: 4}}>
					<View style={{flexDirection: 'row'}}>
						{ContainerCategories.returnCategoryIcon(this.objCategoryIcon.COLLECTION, this.objCategoryIcon.ICON)}
						<Text style={{fontSize: 18, fontWeight: '600'}}>{this.notificationTitle}</Text>
					</View>
					<Text style={{fontSize: 16}}>{this.notificationSubtitle}</Text>
				</View>
			</TouchableOpacity>
		)
	}
}

export class ElementsNotificationListItem extends React.Component{
	objUserData = {'ID': null, 'data': {'NAME': 'Cargando...'}};
	urlUserProfilePic = '';
	async getUserData(){
		let uidUser = this.props.dataTask.data.USERS.find((item) => (item['ROLE'] == 'WORKER' || item['ROLE'] == 'CLIENT') && item['UID'] != firebase.auth().currentUser.uid )['UID'];
		let docUser = await firebase.firestore().collection('USERS').doc(uidUser).get();
		this.objUserData['ID'] = docUser.id;
		this.objUserData['data'] = docUser.data();
		let uriDownload = await firebase.storage().ref().child('PROFILE_PICS/'+uidUser).getDownloadURL()
		this.urlUserProfilePic = uriDownload;
		this.forceUpdate();
	}
	returnNotificationTitle(){
		switch (this.props.dataTask.data.STATUS) {
			case 'UNASIGNED':
				return 'Nueva tarea de '+this.props.dataTask.data.CATEGORY;
				break;
			case 'ASIGNED':
				if(this.props.dataTask.userRole == 'CLIENT'){
					return this.objUserData.data.NAME;
				} else {
					return 'Nueva tarea de '+this.props.dataTask.data.CATEGORY;
				}
				break;
			case 'ACTIVE':
				return this.objUserData.data.NAME;
				break;
		}
	}
	returnNotificationSubtitle(){
		switch (this.props.dataTask.data.STATUS) {
			case 'UNASIGNED':
				if(this.props.dataTask.userRole == 'CLIENT'){
					return 'Publicaste una tarea';
				} else if (this.props.dataTask.userRole == 'INTERESTED'){
					return 'Tes suscribiste a una tarea';
				}
				break;
			case 'ASIGNED':
				if(this.props.dataTask.userRole == 'CLIENT'){
					return 'Asignaste un trabajador';
				} else if (this.props.dataTask.userRole == 'WORKER'){
					return 'Fuiste asignado a esta tarea';
				}
				break;
			case 'ACTIVE':
				return 'Último mensaje'
		}
	}

	renderNotificationImage(){
		switch (this.props.dataTask.data.STATUS){
			case 'UNASIGNED':
				return <View style={{height: 48, width: 48, borderRadius: 24, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} />
				break;
			case 'ASIGNED':
				if(this.props.dataTask.userRole == 'CLIENT'){
					return <Image source={{uri: this.urlUserProfilePic}} style={{height: 48, width: 48, borderRadius: 24, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} />
				} else if (this.props.dataTask.userRole == 'WORKER'){
					return <View style={{height: 48, width: 48, borderRadius: 24, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} />
				}
				break;
			case 'ACTIVE':
				return <Image source={{uri: this.urlUserProfilePic}} style={{height: 48, width: 48, borderRadius: 24, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}} />
				break;
		}
	}

	returnWorkerAdminIcon(){
		if(this.props.dataTask.userRole == 'CLIENT'){
			return <MaterialCommunityIcons name='security-home' color='rgb(76,217,100)' size={24} style={{margin: 4}}/>
		} else if (this.props.dataTask.userRole == 'WORKER'){
			return <MaterialCommunityIcons name='worker' color='rgb(160,160,160)' size={24} style={{margin: 4}}/>
		} else if (this.props.dataTask.userRole == 'INTERESTED'){
			return <MaterialCommunityIcons name='eye' color='rgb(160,160,160)' size={24} style={{margin: 4}}/>
		}
	}

	async componentWillMount(){
		if(this.props.dataTask.data.STATUS != 'UNASIGNED'){
			this.getUserData();
		}
		this.forceUpdate();
	}

	render(){
		return(
			<TouchableOpacity onPress={this.props.onPress} style={{padding: 4, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(160,160,160,0.2)', paddingTop: 8, paddingBottom: 8, width: '100%'}}>
				{this.renderNotificationImage()}
				<View style={{margin: 4, flex: 2}}>
					<View style={{flexDirection: 'row'}}>
						<Text style={{fontSize: 18, fontWeight: '600'}}>{this.returnNotificationTitle()}</Text>
					</View>
					<Text style={{fontSize: 16}}>{this.returnNotificationSubtitle()}</Text>
				</View>
				{this.returnWorkerAdminIcon()}
			</TouchableOpacity>
		)
	}

}

/* -- TASK LIST ITEM (based on USER LIST ITEM)*/
export class ElementsTaskListItem extends React.Component{
	objCategoryIcon = {
		'ID': 'loading',
		'data': {
			'ICON': 'loading',
			'COLLECTION': 'material-community',
		}
	}
	returnConditionalStyleBorder(){
		if(this.props.showBorder != false){
			return {borderBottomColor: 'rgba(160,160,160,0.2)', borderBottomWidth: 1,}
		} else {
			return {}
		}
	}
	//! UPDATE WITH PROPS
	returnConditionalStyleCard(){
		if(this.props.type != 'card'){
			return [this.returnConditionalStyleBorder(), {padding: 0}]
		} else {
			return {borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, borderRadius: 8, backgroundColor: 'white', padding: 8}
		}
	}
	async componentWillMount(){
		this.objCategoryIcon = arrayCategoriesData.find((item)=> item['ID'] == this.props.dataTask.data['CATEGORY'] );
		this.forceUpdate();
	}
	render(){
		return(
			<TouchableOpacity style={[this.returnConditionalStyleCard(), {paddingTop: 8, paddingBottom: 8}]} onPress={this.props.onPress}>
				<View style={{flexDirection: 'row', alignItems: 'center', flex: 1, padding: 4}}>
					<View style={{height: 40, width: 40, borderRadius: 8, margin: 4, backgroundColor: 'black', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
					</View>
					<View style={{margin: 4, flex: 1}}>
						<Text style={{fontSize: 18, fontWeight: '600', flex: 1}}>{this.props.dataTask.data.CATEGORY}</Text>
						<Text style={{fontSize: 12, flex: 1}}>{'CERCA DE ' + this.props.dataTask.data.ADDRESS}</Text>
					</View>
				</View>
				<Text style={{margin: 8, fontSize: '16'}}>{this.props.dataTask.data.DESCRIPTION}</Text>
				{this.props.children}
			</TouchableOpacity>
		)
	}
}
/* -- */
export class ElementsTaskService extends React.Component{
	state={
		quantity: 0
	}
	addService(){
		if(this.state.quantity < 11){
			this.props.onChangeCart({
				'PRICE': this.props.dataService.PRICE,
				'TITLE': this.props.dataService.TITLE,
				'QUANTITY': this.state.quantity+1,
			})
			this.setState({quantity: this.state.quantity+1});
		}
	}
	removeService(){
		if(this.state.quantity > 0){
			this.props.onChangeCart({
				'PRICE': this.props.dataService.PRICE,
				'TITLE': this.props.dataService.TITLE,
				'QUANTITY': this.state.quantity-1,
			})
			this.setState({quantity: this.state.quantity-1});
		}
	}
	renderConditionalControls(){
		if(this.props.editable){
			return(
				<View style={{margin: 2, backgroundColor: 'rgba(160,160,160,0.2)', borderRadius: 8, flexDirection: 'row', alignItems: 'center'}}>
					<MaterialIcons name='remove' size={24} style={{margin: 6}} onPress={()=>{this.removeService()}}/>
					<Text style={{fontSize: 16}}>{this.state.quantity}</Text>
					<MaterialIcons name='add' size={24} style={{margin: 6}} onPress={()=>{this.addService()}}/>
				</View>
			)
		} else {
			return(
				<View style={{margin: 2, backgroundColor: 'rgba(160,160,160,0.2)', borderRadius: 8, flexDirection: 'row', alignItems: 'center'}}>
					<Text style={{fontSize: 16, margin: 6}}>{this.state.quantity}</Text>
				</View>
			)
		}
	}
	componentWillMount(){
		if(this.props.dataService.QUANTITY){
			this.setState({quantity: this.props.dataService.QUANTITY});
		}
	}
	render(){
		return(
			<View style={{margin: 4, flexDirection: 'row', alignItems: 'center'}}>
				<View style={{margin:2, flex: 1}}>
					<Text style={{margin: 2, fontSize: 24, fontWeight: '600'}}>{this.props.dataService.TITLE}</Text>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						{this.renderConditionalControls()}
						<Text style={{margin: 2, fontSize: 16}}>{'x $' + this.props.dataService.PRICE}</Text>
					</View>
				</View>
				<Text style={{margin: 4, fontSize: 24}}>{ '$'+this.props.dataService.PRICE*this.state.quantity }</Text>
			</View>
		)
	}
}

/* UI ELEMENTS / CONTROLS*/
/* -- BUTTON TOOLBAR */
export class ElementsChatToolbarButton extends React.Component{
	returnConditionalStyle(){
		switch (this.props.type) {
			case 'fill':
				return {backgroundColor: this.props.buttonColor}
				break;
			case 'outline':
				return {borderWidth: 1, borderColor: this.props.buttonColor}
				break;
			case 'inline':
				return {}
				break;
			case 'disabled':
				return {backgroundColor: 'rgba(160,160,160,0.4)'}
				break;
			default:
				return {backgroundColor: this.props.buttonColor}
				break;
		}
	}
	returnConditionalStyleTitle(){
		if(this.props.textColor){
			return {color: this.props.textColor}
		} else {
			return {color: 'black'}
		}
	}
	renderConditionalTitle(){
		if(this.props.title){
			return(
				<Text style={[this.returnConditionalStyleTitle(), {margin: 8, fontSize: 16, textAlign: 'center', fontWeight: '600'}]}>{this.props.title}</Text>
			)
		}
	}
	render(){
		return(
			<TouchableOpacity style={[this.props.style, this.returnConditionalStyle(), {margin: 4, minWidth: 48, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0, marginBottom: 0}]} onPress={this.props.onPress}>
				{this.renderConditionalTitle()}
				{this.props.children}
			</TouchableOpacity>
		)
	}
}
/* -- CHAT TOOLBAR */
export class ElementsChatToolbar extends React.Component{
	state={
		newMessage: '',
		renderConditionalOptions: false
	}

	sendMessage(){
		if(this.state.newMessage){
			UtilitiesTask.addToTask( this.props.dataTask , {
				'CONTENT': this.state.newMessage,
				'TYPE': 'MESSAGE',
				'USER': firebase.auth().currentUser.uid,
				'DATE': new Date(),
			})
		}
	}

	sendLocation(newLocation){
		if(newLocation){
			UtilitiesTask.addToTask( this.props.dataTask , {
				'CONTENT': newLocation,
				'TYPE': 'MESSAGE/LOCATION',
				'USER': firebase.auth().currentUser.uid,
				'DATE': new Date(),
			})
		}
	}

	sendServices(arrayServicesCart){
		if(arrayServicesCart.length >= 0){
			arrayServicesCart.map((l,i)=>{
				UtilitiesTask.addToTask( this.props.dataTask , {
					'CONTENT': l,
					'TYPE': 'SERVICE',
					'USER': firebase.auth().currentUser.uid,
					'DATE': new Date(),
				})
			})
		}
	}

	toggleConditionalOptions(){
		this.setState({renderConditionalOptions: !this.state.renderConditionalOptions })
	}

	returnConditionalStyleWidth(){
		if(!this.state.renderConditionalOptions){
			return {width: '100%'}
		}
	}

	// IMPORTANT everything inside this component should be 48pt in height
	//UNASIGNED CLIENT
	renderUnasignedClient(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
				<ElementsChatToolbarButton title='EDITAR' buttonColor='rgba(160,160,160,0.2)' style={{flex: 1}} onPress={()=>{
					App.modalPromptOpen(<PromptEditTask dataTask={this.props.dataTask} ></PromptEditTask>)
				}}></ElementsChatToolbarButton>
				<ElementsChatToolbarButton type='outline' title='ELIMINAR' buttonColor='rgb(255,59,48)' textColor='rgb(255,59,48)' style={{flex: 1}} onPress={()=>{ UtilitiesTask.removeTask( this.props.dataTask ) }}></ElementsChatToolbarButton>
			</View>
		)
	}

	//UNASIGNED PUBLIC
	renderUnasignedPublic(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
				<ElementsChatToolbarButton title='SOLICITAR TAREA' buttonColor='rgb(0,122,255)' style={{flex: 1}} onPress={()=>{ UtilitiesTask.userApply( this.props.dataTask, firebase.auth().currentUser.uid ) }}></ElementsChatToolbarButton>
			</View>
		)
	}

	//UNASIGNED APPLIED
	renderUnasignedApplied(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
				<ElementsChatToolbarButton title='CANCELAR' buttonColor='rgb(255,59,48)' textColor='white' style={{flex: 1}} onPress={()=>{ UtilitiesTask.userApplyCancel( this.props.dataTask, firebase.auth().currentUser.uid ) }}></ElementsChatToolbarButton>
			</View>
		)
	}

	//ASIGNED ADMIN
	renderAsignedClient(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
			<ElementsChatToolbarButton title='CANCELAR' buttonColor='rgb(255,59,48)' textColor='white' style={{flex: 1}} onPress={()=>{ UtilitiesTask.clientDeclineTask( this.props.dataTask ) }}></ElementsChatToolbarButton>
			</View>
		)
	}

	// ASIGNED ASIGNED WORKER
	renderAsignedWorker(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
				<ElementsChatToolbarButton title='ACEPTAR' buttonColor='rgb(76, 217, 100)' textColor='white' style={{flex: 1}} onPress={()=>{ UtilitiesTask.userAcceptTask( this.props.dataTask, firebase.auth().currentUser.uid ) }}></ElementsChatToolbarButton>
				<ElementsChatToolbarButton title='DECLINAR' buttonColor='rgb(255,59,48)' textColor='white' style={{flex: 1}} onPress={()=>{ UtilitiesTask.userDeclineTask( this.props.dataTask, firebase.auth().currentUser.uid ) }}></ElementsChatToolbarButton>
			</View>
		)
	}

	// ASIGNED PUBLIC
	renderAsignedPublic(){
		return(
			<View style={{padding: 8, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(160,160,160,0.8)'}}>
				<Text>Esta tarea ya fue asignada. </Text>
			</View>
		)
	}

	renderActiveClientWorker(){
		return(
			<ScrollView horizontal scrollEnabled={this.state.renderConditionalOptions} style={{width: '100%'}} contentContainerStyle={this.returnConditionalStyleWidth()}>
				<View style={[ this.returnConditionalStyleWidth(),  {padding: 12, flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8}]}>
					{this.renderConditionalOptions()}
					<View style={{margin: 4, marginTop: 0, marginBottom: 0, minHeight: 40, borderColor: 'rgba(160,160,160,0.4)', borderWidth: 1, borderRadius: 24, flex: 1, padding: 4, flexDirection: 'row'}}>
						<TextInput style={{margin: 4, flex: 1, padding: 4}} multiline={true} blurOnSubmit={true} placeholder='Escribe un mensaje...'  onChangeText={(newText) => { this.setState({newMessage: newText}) }} returnKeyLabel='Enviar' onSubmitEditing={()=>{ this.sendMessage() }} onFocus={()=>{ this.setState({renderConditionalOptions: false}) }}/>
						<TouchableOpacity style={{margin: 4, alignItems: 'center', alignContent: 'center', justifyContent: 'center'}} onPress={()=>{ this.sendMessage() }}> <Ionicons name='md-send' size={24}/> </TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		)
	}


	renderConditionalOptions(){
		if(this.state.renderConditionalOptions){
			return(
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					<ElementsChatToolbarButton buttonColor='rgba(160,160,160,0.2)' onPress={()=>{
						App.modalPromptOpen(<PromptChatLocation onSubmit={(newLocation)=> { this.sendLocation({newLocation}) }}></PromptChatLocation>)
					}}>
						<MaterialIcons name='add-location' size={32} color='rgb(0,122,255)'/>
					</ElementsChatToolbarButton>

					<ElementsChatToolbarButton buttonColor='rgba(160,160,160,0.2)' onPress={()=>{
						App.modalPromptOpen(<PromptChatServices dataTask={this.props.dataTask} onChangeCart={(arrayServicesCart)=> this.sendServices(arrayServicesCart) }/>)
					}}>
						<FontAwesome name='cart-plus' size={32} color='rgb(0,122,255)'/>
					</ElementsChatToolbarButton>

					<ElementsChatToolbarButton buttonColor='rgba(160,160,160,0.2)' onPress={()=>{
						App.modalPromptOpen(<PromptEditTask dataTask={this.props.dataTask} ></PromptEditTask>)
					}}>
						<MaterialCommunityIcons name='account-edit' size={32} color='rgb(0,122,255)'/>
					</ElementsChatToolbarButton>

					<ElementsChatToolbarButton buttonColor='rgba(160,160,160,0.2)' onPress={()=>{}}>
						<MaterialIcons name='close' size={32} color='rgb(255,59,48)'/>
					</ElementsChatToolbarButton>

					<ElementsChatToolbarButton buttonColor='rgb(0,122,255)' onPress={()=>{ this.toggleConditionalOptions() }}>
						<Entypo name='chevron-small-left' size={32} color='white' />
					</ElementsChatToolbarButton>

				</View>
			)
		} else {
			return(
				<ElementsChatToolbarButton buttonColor='rgb(0,122,255)' onPress={()=>{ this.toggleConditionalOptions() }}>
					<Entypo name='chevron-small-right' size={32} color='white' />
				</ElementsChatToolbarButton>
			)
		}
	}

	render(){

		if( this.props.dataTask.data.STATUS == 'UNASIGNED' ){
			if(this.props.dataTask.userRole == 'CLIENT'){
				return this.renderUnasignedClient();
			} else if (this.props.dataTask.userRole == 'INTERESTED'){
				return this.renderUnasignedApplied();
			} else if (this.props.dataTask.userRole == 'PUBLIC'){
				return this.renderUnasignedPublic();
			}
		} else if (this.props.dataTask.data.STATUS == 'ASIGNED'){
			if(this.props.dataTask.userRole == 'CLIENT'){
				return this.renderAsignedClient();
			} else if (this.props.dataTask.userRole == 'WORKER'){
				return this.renderAsignedWorker();
			} else if (this.props.dataTask.userRole == 'INTERESTED' || this.props.dataTask.userRole == 'PUBLIC'){
				return this.renderAsignedPublic();
			}
		} else if (this.props.dataTask.data.STATUS == 'ACTIVE'){
			if (this.props.dataTask.userRole == 'CLIENT' || this.props.dataTask.userRole == 'WORKER'){
				return this.renderActiveClientWorker();
			}
		}

	}
}
/* -- CHAT MESSAGE BUBBLE */
export class ElementsChatBubble extends React.Component{
	returnConditionalBubblePlacement(){
		if(this.props.dataContent.USER == firebase.auth().currentUser.uid){
			return {justifyContent: 'flex-end'}
		} else {
			return {justifyContent: 'flex-start'}
		}
	}
	render(){
		return(
			<View style={[{padding: 8, flexDirection: 'row'}, this.returnConditionalBubblePlacement()]}>
				<View style={{borderRadius: 16, borderWidth: 1, borderColor: 'rgba(160,160,160,0.4)', padding: 16, maxWidth: '80%'}}>
					<Text style={{fontSize: 16}}>{ this.props.dataContent.CONTENT }</Text>
				</View>
			</View>
		)
	}
}
/* -- CHAT INFO BUBBLE */
export class ElementsChatInfo extends React.Component{
	returnConditionalText(){
		switch (this.props.dataContent.CONTENT) {
			case 'PUBLISHED':
				return 'Tarea publicada';
				break;
			case 'ACTIVE':
				return 'Esta tarea ha sido aceptada';
				break;
			default:
				return this.props.dataContent.CONTENT
		}
	}
	render(){
		return(
			<View style={{padding: 8, flexDirection: 'row', justifyContent: 'center'}}>
				<View style={{borderRadius: 16, padding: 8, maxWidth: '80%', backgroundColor: 'rgba(160,160,160,0.4)'}}>
					<Text style={{fontSize: 16, color: 'white'}}>{ this.returnConditionalText() }</Text>
				</View>
			</View>
		)
	}
}
/* -- CHAT LOCATION BUBBLE*/
export class ElementsChatLocation extends React.Component{
	returnConditionalBubblePlacement(){
		if(this.props.dataContent.USER == firebase.auth().currentUser.uid){
			return {alignItems: 'flex-end'}
		} else {
			return {alignItems: 'flex-start'}
		}
	}
	render(){
		return(
			<View style={[this.returnConditionalBubblePlacement(), {flex: 1}]}>
				<MapView cacheEnabled style={{height: 160, margin: 8, borderRadius: 16, width: '80%'}}
					region={{
						latitude: this.props.dataContent.CONTENT.newLocation.coords.latitude,
						longitude: this.props.dataContent.CONTENT.newLocation.coords.longitude,
						latitudeDelta: 0.002,
						longitudeDelta: 0.002,
					}}
				><MapView.Marker coordinate={{latitude: this.props.dataContent.CONTENT.newLocation.coords.latitude, longitude: this.props.dataContent.CONTENT.newLocation.coords.longitude}} /></MapView>
				<View style={{borderRadius: 16, borderWidth: 1, borderColor: 'rgba(160,160,160,0.4)', padding: 8, maxWidth: '80%', margin: 8, flexDirection: 'row', alignItems: 'center'}}>
					<Entypo name='location-pin' size={16} style={{margin: 8}}></Entypo>
					<Text style={{fontSize: 16, flex: 1, margin: 8}}>{ this.props.dataContent.CONTENT.newLocation.address }</Text>
				</View>
			</View>
		)
	}
}
/* -- CHAT SERVICE BUBBLE*/
export class ElementsChatService extends React.Component{
	returnConditionalBubblePlacement(){
		if(this.props.dataContent.USER == firebase.auth().currentUser.uid){
			return {justifyContent: 'flex-end'}
		} else {
			return {justifyContent: 'flex-start'}
		}
	}
	renderConditionalOptions(){
		if(this.props.dataContent.USER != firebase.auth().currentUser.uid){
			return(
				<View style={{flexDirection: 'row', flex: 1}}>
					<ElementsInputButton title='ACEPTAR' type='fill' buttonColor='rgb(76,217,100)' compact={true} style={{flex: 1}} textColor='white'/>
					<ElementsInputButton title='DECLINAR' type='fill' buttonColor='rgb(255,59,48)' compact={true} style={{flex: 1}} textColor='white'/>
				</View>
			)
		}
	}
	render(){
		return(
			<View style={[{padding: 8, flexDirection: 'row'}, this.returnConditionalBubblePlacement()]}>
				<View style={{borderRadius: 16, borderWidth: 1, borderColor: 'rgba(160,160,160,0.4)', width: '80%', padding: 8}}>
					<ElementsTaskService dataService={this.props.dataContent.CONTENT} />
				</View>
			</View>
		)
	}
}


/* ==== UI ELEMENTS end ==== */

/* ========================= */
/* ==== CATEGORIES ==== */

/* -- RETURN CATEGORIES SELECTLIST*/
export class ContainerCategories extends React.Component{
  dataCategories = [];
  selectCategoryObj = null;
  selectCategory(selectCategoryObj){
    if(this.selectCategoryObj != selectCategoryObj){
      this.selectCategoryObj = selectCategoryObj;
    } else {
      this.selectCategoryObj = null;
    }
    this.forceUpdate();
  }
  static returnCategoryIcon(COLLECTION, ICON, iconColor){
    switch (COLLECTION) {
      case 'font-awesome':
        return <FontAwesome name={ICON} size={24} style={{margin: 4, marginTop: 2, marginBottom: 2, width: 24}} color={iconColor}/>
        break;
      case 'material-community':
        return <MaterialCommunityIcons name={ICON} size={24} style={{margin: 4, marginTop: 2, marginBottom: 2, width: 24}} color={iconColor}/>
        break;
      case 'ionicon':
        return <Ionicons name={ICON} size={24} style={{margin: 4, marginTop: 2, marginBottom: 2, width: 24}} color={iconColor}/>
        break;
      case 'entypo':
        return <Entypo name={ICON} size={24} style={{margin: 4, marginTop: 2, marginBottom: 2, width: 24}} color={iconColor}/>
        break;
      case 'material':
        return <MaterialIcons name={ICON} size={24} style={{margin: 4, marginTop: 2, marginBottom: 2, width: 24}} color={iconColor}/>
        break;
    }
  }
  render(){
    return(
      <ElementsInputRadioFullscreen data={this.props.data} title='CATEGORÍAS'
        onSelect={(l)=>{
          this.selectCategory(l);
          this.props.onSelectCategory(this.selectCategoryObj);
        }}
        optionChildren={(l)=>{
          return(
            <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 12}}>
              {ContainerCategories.returnCategoryIcon(l.data.COLLECTION, l.data.ICON)}
              <Text style={{margin: 4, fontSize: 16}}>{l.ID}</Text>
            </View>
          )
        }}
        selectedChildren={(l)=>{
          return(
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {ContainerCategories.returnCategoryIcon(l.data.COLLECTION, l.data.ICON)}
              <Text style={{margin: 8, fontSize: 16, marginTop: 2, marginBottom: 2}}>{l.ID}</Text>
            </View>
          )
        }}
      ></ElementsInputRadioFullscreen>
    )
  }
}

/* ==== CATEGORIES end ==== */

/* ======================== */
/* ==== PROMPTS ====*/

/* -- LOGIN */
export class PromptLogin extends React.Component{
  form = 'login';
  state = {
    loginUsername: '',
    loginPassword: '',

		newUserProfileURI: '',
    newUserName: '',
    newUserUsername: '',
    newUserMail: '',
    newUserPassword: '',
    newUserPasswordVerify: '',

    mismatchPasswords: true,
  }

  userProperyExists(property, value){
    return firebase.firestore().collection("USERS").where(property, "==", value).get().then((doc)=>{
      if(doc.exists){
        return true;
      }
    })
  }

  login(){
    firebase.auth().signInWithEmailAndPassword(this.state.loginUsername, this.state.loginPassword).catch((err)=>{
			alert(JSON.stringify(err))
		});
  }

  async signup(){
		const newUserProfileResponse = await fetch(this.state.newUserProfileURI);
		const newUserProfileBlob = await newUserProfileResponse.blob();
    firebase.auth().createUserWithEmailAndPassword(this.state.newUserMail, this.state.newUserPassword).then((user)=>{
			firebase.storage().ref().child("PROFILE_PICS/"+firebase.auth().currentUser.uid).put(newUserProfileBlob);
      firebase.firestore().collection("USERS").doc(firebase.auth().currentUser.uid).set({
        NAME: this.state.newUserName,
        EMAIL: this.state.newUserMail,
        USERNAME: this.state.newUserUsername,
        LOCATION_TRACK: true,
				JOB_COUNT: 0,
				LOCATION: new firebase.firestore.GeoPoint(0,0),
				RATING: 0,
				RATING_CONTENTS: [],
				JOB_CATEGORIES: [],
				BIO: 'Hello ManGo!'
      })
    }).catch((err)=>{
			alert(JSON.stringify(err));
		})
  }

  renderConditionalForm(){
    if(this.form == 'login'){
      return(
          <View style={{padding: 16, justifyContent: 'center'}}>
            <Text style={{fontSize: 48, fontWeight: '800', margin: 8, color: '#E69400'}}>INICIAR SESIÓN</Text>
            <ElementsInputName name='USUARIO' onChangeText={(newText)=>{ this.setState({loginUsername: newText}) }}></ElementsInputName>
            <ElementsInputName name='CONTRASEÑA' onChangeText={(newText)=>{ this.setState({loginPassword: newText}) }} onSubmitEditing={()=>{ this.login() }}></ElementsInputName>

            <ElementsInputButton title='INICIAR SESIÓN' type='fill' buttonColor='rgb(0,122,255)' onPress={()=>{this.login()}}></ElementsInputButton>
            <ElementsInputButton title='¿NO TIENES UNA CUENTA? REGÍSTRATE' type='outline' buttonColor='rgb(0,122,255)' onPress={()=>{this.form = 'register'; this.forceUpdate()}}></ElementsInputButton>
          </View>
      )
    } else {
      return(
          <View style={{padding: 16, justifyContent: 'center'}}>
            <Text style={{fontSize: 48, fontWeight: '800', margin: 8, color: '#E69400'}}>NUEVA CUENTA</Text>
            <ElementsInputImage onPickImage={(result)=>{
							this.setState({newUserProfileURI: result.uri});
						}}></ElementsInputImage>
            <ElementsInputName name='NOMBRE' onChangeText={(newText)=>{ this.setState({newUserName: newText}) }}></ElementsInputName>
            <ElementsInputName name='USUARIO' onChangeText={(newText)=>{ this.setState({newUserUsername: newText}) }}></ElementsInputName>
            <ElementsInputName name='EMAIL' onChangeText={(newText)=>{ this.setState({newUserMail: newText}) }}></ElementsInputName>
            <ElementsInputName name='CONTRASEÑA' onChangeText={(newText)=>{ this.setState({newUserPassword: newText}) }}></ElementsInputName>
            <ElementsInputName name='VERIFICAR CONTRASEÑA' isError={!this.state.mismatchPasswords} isErrorMessage='LAS CONTRASEÑAS NO COINCIDEN' onChangeText={(newText)=>{
              this.setState({newUserPasswordVerify: newText});
              if(this.state.newUserPassword == newText){
                this.setState({mismatchPasswords: false})
                this.forceUpdate()
              }

            }}></ElementsInputName>

            <ElementsInputButton title='REGISTRARME' type='fill' buttonColor='rgb(0,122,255)' onPress={()=>{this.signup()}}></ElementsInputButton>
            <ElementsInputButton title='YA TENGO UNA CUENTA' type='outline' buttonColor='rgb(0,122,255)' onPress={()=>{this.form = 'login'; this.forceUpdate()}}></ElementsInputButton>
          </View>
      )
    }
  }
  render(){
    return(
      <KeyboardAvoidingView behavior='padding'>
        <SafeAreaView>
          <ScrollView>
            {this.renderConditionalForm()}
            <Text style={{fontSize: 16, fontWeight: '600', textAlign: 'center', padding: 24}}>{AppVersionNumber}</Text>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }
}
/* -- EDIT JOB_CATEGORY*/
export class PromptEditCategory extends React.Component{
	state={
		shouldAddService: false,
		newTitleAddService: '',
		newPriceAddService: 0,
		newDescription: '',
	}
	categoryIndex = null;
	categoryServices = [];
	renderConditionalAdd(){
		if(this.state.shouldAddService){
			return(
				<View style={{padding: 8, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, }}>
					<Text style={{margin: 8, fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 16}}>AÑADIR SERVICIO</Text>
					<ElementsInputName name='NOMBRE' value={this.state.newTitleAddService } style={{flexGrow: 1, flex: 1}} onChangeText={(newText)=>{ this.setState({newTitleAddService: newText}) }} ></ElementsInputName>
					<ElementsInputName name='PRICE' value={this.state.newPriceAddService } onChangeText={(newText)=>{ this.setState({newPriceAddService: UtilitiesPrice.getPriceValue(newText)}) }} ></ElementsInputName>
					<ElementsInputButton type='fill' title='AÑADIR' buttonColor='rgba(160,160,160,0.2)' onPress={()=>{this.addService()}}></ElementsInputButton>
				</View>
			)
		} else {
			return(
				<TouchableOpacity style={{padding: 8, paddingTop: 12, paddingBottom: 12, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} onPress={()=>{
					this.setState({shouldAddService: true});
				}}>
					<Text style={{margin: 8, fontSize: 16, fontWeight: '800'}}>AÑADIR SERVICIO</Text>
				</TouchableOpacity>
			)
		}
	}
	renderConditionalUpdateButton(){
		if(this.state.newDescription != this.props.categoryData.DESCRIPTION){
			return(
				<ElementsInputButton title='ACTUALIZAR' type='fill' buttonColor='rgb(0,122,255)' onPress={()=>{
					this.updateDescription()
				}}></ElementsInputButton>
			)
		}
	}

	async firebaseUpdateInfo(){
		firebase.firestore().collection('USERS').doc(firebase.auth().currentUser.uid).update({
			'JOB_CATEGORIES': objCurrentUserData.data.JOB_CATEGORIES
		});
	}

	updateDescription(){
		objCurrentUserData.data.JOB_CATEGORIES[this.categoryIndex].DESCRIPTION = this.state.newDescription;
		this.forceUpdate();
		this.firebaseUpdateInfo();
	}
	addService(){
		if(this.state.newTitleAddService || this.state.newPriceAddService){
			objCurrentUserData.data.JOB_CATEGORIES[this.categoryIndex].SERVICES.push({
				'TITLE': this.state.newTitleAddService,
				'PRICE': parseFloat(this.state.newPriceAddService.replace(/[^\d\.]/, ''))
			});
			this.setState({newTitleAddService: ''});
			this.setState({newPriceAddService: ''});
			this.setState({shouldAddService: 0});
			this.forceUpdate();
			this.firebaseUpdateInfo();
		}
	}
	removeService(i){
		Alert.alert(
			'ELIMINAR SERVICIO',
			'¿Estás seguro de que desas eliminar este servicio?',
			[
				{text: 'Conservar'},
				{text: 'Eliminar', onPress: ()=> {
					objCurrentUserData.data.JOB_CATEGORIES[this.categoryIndex].SERVICES.splice(i,1);
					this.forceUpdate();
					this.firebaseUpdateInfo();
				}}
			]
		)
	}
	async componentWillMount(){
		this.categoryIndex = await objCurrentUserData.data.JOB_CATEGORIES.indexOf(this.props.categoryData);
		this.forceUpdate();
	}
	render(){
		return(
			<ScrollView>
				<View style={{padding: 16, paddingTop: 8, paddingBottom: 8}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>EDITAR CATEGORÍA</Text>
				</View>
				<View style={{padding: 8}}>
					<ElementsProfileListItem dataUser={this.props.objCurrentUserData} type='card'></ElementsProfileListItem>
				</View>
				<View style={{padding: 16}}>
					<View style={{marginTop: 16}}>
						<ElementsInputTextarea value={this.props.categoryData.DESCRIPTION} placeholder='AÑADE UNA DESCRPIPCIÓN' type='card' onChangeText={(newText)=>{
							this.setState({newDescription: newText});
						}} fontSize='16'></ElementsInputTextarea>
						{this.props.categoryData.SERVICES.map((m,j)=>{
							return(
								<TouchableOpacity style={{padding: 8, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
									onLongPress={()=>{
										this.removeService(j);
									}}
								>
									<Text style={{margin: 8, fontSize: 16, fontWeight: '800'}}>{m.TITLE}</Text><Text style={{margin: 4, fontSize: 12}}>{'$'+m.PRICE}</Text>
								</TouchableOpacity>
							)
						})}
						{this.renderConditionalAdd()}
					</View>
				</View>
				<View style={{padding: 8}}>
					{this.renderConditionalUpdateButton()}
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}
/* -- SUCCESS */
export class PromptSuccess extends React.Component{
	render(){
		return(
			<View style={{padding: 16}}>
				<Text style={{margin: 8, fontSize: 40, fontWeight: '800'}}>{this.props.title}</Text>
				<Text style={{margin: 8, fontSize: 24}}>{this.props.subtitle}</Text>
				<ElementsInputButton type='outline' buttonColor='black' title='OK' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
			</View>
		)
	}
}
/* -- ADD JOB_CATEGORY*/
export class PromptAddCategory extends React.Component{
	state={
		categoryObj: {name : null},
		shouldAddService: false,
		newTitleAddService: '',
		newPriceAddService: 0
	}
	newCategoryObj = {
		'DESCRIPTION': '',
		'NAME': null,
		'SERVICES': []
	}
	addService(){
		this.newCategoryObj['SERVICES'].push({
			'TITLE': this.state.newTitleAddService,
			'PRICE': parseFloat(this.state.newPriceAddService.replace(/[^\d\.]/, ''))
		});
		this.setState({newTitleAddService: ''});
		this.setState({newPriceAddService: ''});
		this.setState({shouldAddService: false});
		this.forceUpdate();
	}
	removeService(i){
		this.newCategoryObj['SERVICES'].splice(i,1);
		this.forceUpdate();
	}

	addCategory(){
		if(this.newCategoryObj.NAME){
			objCurrentUserData.data.JOB_CATEGORIES.push(this.newCategoryObj);
			firebase.firestore().collection('USERS').doc(firebase.auth().currentUser.uid).update({
				'JOB_CATEGORIES': objCurrentUserData.data.JOB_CATEGORIES,
			});
			this.forceUpdate();
		}
		else {
			alert("Selecciona una categoría");
		}
		this.props.onAddCategory;
	}

	returnCategoriesUnselected(){
		return arrayCategoriesData.filter((item)=>{
			return !objCurrentUserData.data.JOB_CATEGORIES.some((otherItem) => otherItem['NAME'] == item['ID'])
		})
	}

	renderConditionalAdd(){
		if(this.state.shouldAddService){
			return(
				<View style={{padding: 0, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, }}>
					<Text style={{margin: 8, fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 16}}>AÑADIR SERVICIO</Text>
					<ElementsInputName name='NOMBRE' value={this.state.newTitleAddService } style={{flexGrow: 1, flex: 1}} onChangeText={(newText)=>{ this.setState({newTitleAddService: newText}) }} ></ElementsInputName>
					<ElementsInputName name='PRICE' value={this.state.newPriceAddService } onChangeText={(newText)=>{ this.setState({newPriceAddService: UtilitiesPrice.getPriceValue(newText)}) }} ></ElementsInputName>
					<ElementsInputButton type='fill' title='AÑADIR' buttonColor='rgba(160,160,160,0.2)' onPress={()=>{this.addService()}}></ElementsInputButton>
				</View>
			)
		} else {
			return(
				<TouchableOpacity style={{padding: 8, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} onPress={()=>{
					this.setState({shouldAddService: true});
				}}>
					<Text style={{margin: 8, fontSize: 16, fontWeight: '800'}}>AÑADIR SERVICIO</Text>
				</TouchableOpacity>
			)
		}
	}

	render(){
		return(
			<ScrollView>
				<View style={{padding: 16, paddingTop: 8, paddingBottom: 8}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>AÑADIR CATEGORÍA</Text>
				</View>
				<View style={{padding: 8}}>
					<ContainerCategories data={this.returnCategoriesUnselected()} onSelectCategory={(categoryObj)=>{ this.newCategoryObj['NAME'] = categoryObj.ID; this.forceUpdate() }}/>
				</View>
				<View style={{padding: 16}}>
					<ElementsInputTextarea value={this.newCategoryObj.DESCRIPTION} placeholder='AÑADE UNA DESCRPIPCIÓN' type='card' onChangeText={(newText)=>{
						this.newCategoryObj['DESCRIPTION'] = newText ; this.forceUpdate();
					}} fontSize='16'></ElementsInputTextarea>
					{this.newCategoryObj['SERVICES'].map((l,i)=>{
						return(
							<TouchableOpacity style={{padding: 4, paddingTop: 12, paddingBottom: 12, borderRadius: 8, backgroundColor: 'white', borderColor: 'rgba(160,160,160,0.2)', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
								onLongPress={()=>{
									this.removeService(l);
								}}
							>
								<Text style={{margin: 4, fontSize: 16, fontWeight: '800'}}>{l.TITLE}</Text><Text style={{margin: 4, fontSize: 12}}>{'$'+l.PRICE}</Text>
							</TouchableOpacity>
						)
					})}
					{this.renderConditionalAdd()}
				</View>
				<View style={{padding: 8}}>
					<ElementsInputButton title='AÑADIR' type='fill' buttonColor='rgb(0,122,255)' onPress={()=>{this.addCategory(); App.modalPromptClose()}}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>

				</View>
			</ScrollView>
		)
	}
}
/* -- EDIT SERVICES */
export class PromptEditTask extends React.Component{
	state={
		newDescription: '',
		newLocation: {},
	}
	updateTask(){
		firebase.firestore().collection('TASKS').doc(this.props.dataTask.ID).update({
			DESCRIPTION: this.state.newDescription,
			LOCATION: new firebase.firestore.GeoPoint( this.state.newLocation.coords.latitude, this.state.newLocation.coords.longitude ),
			ADDRESS: this.state.newLocation.address,
		});
		App.modalPromptClose();
	}
	render(){
		return(
			<ScrollView>
				<View style={{padding: 16, paddingTop: 8, paddingBottom: 8}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>EDITAR TAREA</Text>
				</View>
				<View style={{padding: 16, paddingTop: 8, paddingBottom: 8}}>
					<ElementsTaskListItem type='card' dataTask={this.props.dataTask}></ElementsTaskListItem>
				</View>
				<View style={{padding: 16, paddingTop: 8, paddingBottom: 0}}>
					<ElementsInputTextarea value={this.props.dataTask.data.DESCRIPTION} placeholder='AÑADE UNA DESCRPIPCIÓN' type='card' onChangeText={(newText)=>{
						this.setState({newDescription: newText});
					}} fontSize='16'></ElementsInputTextarea>
				</View>
				<View style={{padding:8, paddingTop: 0, paddingBottom: 0}}>
					<ElementsInputLocation initialLocationCoords={{latitude: this.props.dataTask.data.LOCATION._lat, longitude: this.props.dataTask.data.LOCATION._long}} onChangeLocation={(newLocation)=>{
						this.setState({newLocation: newLocation})
					}}></ElementsInputLocation>
				</View>
				<View style={{padding:8}}>
					<ElementsInputButton title='ACTUALIZAR' type='fill' buttonColor='rgb(0,122,255)' onPress={()=>{
						this.updateTask()
					}}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}
/* -- PROFILE */
export class PromptUserProfile extends React.Component{

	render(){
		return(
			<ScrollView>
				<View style={{padding: 16}}>
					<ElementsProfileCard type='card' dataUser={this.props.dataUser}></ElementsProfileCard>
					<ElementsProfileCardCategory type='card' dataCategory={this.props.dataUser.data.JOB_CATEGORIES.find((item) => item['NAME'] == this.props.dataCategoryUser) }></ElementsProfileCardCategory>
				</View>
				<View style={{padding: 16}}>
					<ElementsInputButton title='CONTRATAR' type='fill' buttonColor='black' textColor='white' onPress={this.props.onHire}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}
/* -- HIRE */
export class PromptHireUser extends React.Component{
	state={
		selectCategoryObj: null,
		newDescription: '',
		newLocation: {}
	}
	dataUserCategories = [];

	publishTask(){
		if(this.state.selectCategoryObj.ID && this.state.newDescription && this.state.newLocation.address && this.state.newLocation.coords){
			firebase.firestore().collection('TASKS').doc().set({
				ADDRESS: this.state.newLocation.address,
				LOCATION: new firebase.firestore.GeoPoint( this.state.newLocation.coords.latitude, this.state.newLocation.coords.longitude ),
				DESCRIPTION: this.state.newDescription,
				CATEGORY: this.state.selectCategoryObj.ID,
				STATUS: 'ASIGNED',
				LAST_UPDATE: new Date(),
				USERS: [
					{
						UID: firebase.auth().currentUser.uid,
						ROLE: 'CLIENT'
					},
					{
						UID: this.props.dataUser.ID,
						ROLE: 'WORKER'
					}
				],
				CONTENT: [
					{
						CONTENT: "PUBLISHED",
						DATE: new Date(),
						TYPE: "INFO"
					},
				]
			}).then(()=>{
				App.modalPromptOpen(
					<PromptSuccess title='LA TAREA FUE PUBLICADA CON ÉXITO' subtitle='Pudes ver actualizaciones en tu BUZÓN'></PromptSuccess>
				)
			})
		}
	}

	componentWillMount(){
		this.props.dataUser.data.JOB_CATEGORIES.map((l,i)=>{
			this.dataUserCategories.push(arrayCategoriesData.find((item) => item.ID == l.NAME ));
			this.forceUpdate();
		});
	}
	render(){
		return(
			<ScrollView>
				<View style={{padding: 16}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>NUEVA TAREA</Text>
					<ElementsProfileListItem type='card' dataUser={this.props.dataUser}></ElementsProfileListItem>
					<ElementsInputTextarea placeholder='¿EN QUÉ TE PUEDO AYUDAR?' onChangeText={(newText)=>{
						this.setState({newDescription: newText});
					}} ></ElementsInputTextarea>
				</View>
				<View style={{padding: 16}}>
					<ElementsInputLocation name='UBICACIÓN' onChangeLocation={(newLocation)=>{
						this.setState({newLocation: newLocation})
					}}></ElementsInputLocation>
				</View>
				<View style={{padding: 16}}>
					<ContainerCategories data={this.dataUserCategories} onSelectCategory={(selectCategoryObj)=>{this.setState({selectCategoryObj: selectCategoryObj})}}></ContainerCategories>
				</View>
				<View style={{padding: 16}}>
					<ElementsInputButton title='CONTRATAR' type='fill' buttonColor='black' textColor='white' onPress={()=>{ this.publishTask() }}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}
/* -- PAYMENT */
//! WRITE COMPONENENT

/* -- LOCATION */
export class PromptChatLocation extends React.Component{
	state={newLocation: null}
	render(){
		return(
			<ScrollView>
				<View style={{padding: 16}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>ENVIAR UBICACIÓN</Text>
					<ElementsInputLocation showMap={true} onChangeLocation={(newLocation) => { this.setState({newLocation: newLocation}) }}/>
				</View>

				<View style={{padding: 16}}>
					<ElementsInputButton title='ENVIAR' type='fill' buttonColor='black' textColor='white' onPress={()=>{ this.props.onSubmit(this.state.newLocation); App.modalPromptClose() }}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}
/* -- SERVICES*/
export class PromptChatServices extends React.Component{
	arrayServices = [];
	arrayServicesCart = [];
	returnSubtotal(){
		let subtotal = 0;
		this.arrayServicesCart.map((l,i)=>{
			subtotal = subtotal + (l.PRICE*l.QUANTITY);
		})
		return subtotal;
	}
	async componentWillMount(){
		let uidWorker = await this.props.dataTask.data.USERS.find((item) => item['ROLE'] == 'WORKER')['UID'];
		firebase.firestore().collection('USERS').doc(uidWorker).get().then((doc)=>{
			this.arrayServices = doc.data().JOB_CATEGORIES.find((item) => item['NAME'] == this.props.dataTask.data.CATEGORY)['SERVICES'];
			this.forceUpdate();
		})
	}
	render(){
		return(
			<ScrollView>
				<View style={{padding: 16}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>AÑADIR AL CARRITO</Text>
					{this.arrayServices.map((l,i)=>{
						return <ElementsTaskService editable dataService={l} onChangeCart={(dataService)=>{
							this.arrayServicesCart[i] = dataService;
							this.forceUpdate();
						}}/>
					})}
				</View>
				<View style={{padding: 16}}>
					<Text style={{margin: 8, fontSize: 40, fontWeight: '800'}}>{ '$'+this.returnSubtotal() }</Text>
				</View>
				<View style={{padding: 16}}>
					<ElementsInputButton title='ENVIAR' type='fill' buttonColor='black' textColor='white' onPress={()=>{ this.props.onChangeCart(this.arrayServicesCart); this.forceUpdate() }}></ElementsInputButton>
					<ElementsInputButton title='CANCELAR' type='fill' buttonColor='rgba(200,200,200,0.6)' onPress={()=>{App.modalPromptClose()}}></ElementsInputButton>
				</View>
			</ScrollView>
		)
	}
}


/* ==== PROMPTS end ==== */

/* ===================== */
/* ==== SCREENS ====*/

/* -- PROFILE SCREEN */
export class ScreenProfile extends React.Component{
	render(){
		return(
			<SafeAreaView style={{backgroundColor: 'white'}}>
				<ScrollView stickyHeaderIndices={[1]}>
					<ElementsProfileCard dataUser={this.props.navigation.state.params.dataUser}></ElementsProfileCard>
					<View style={{padding: 16}}>
						<ElementsInputButton type='fill' buttonColor='rgb(0,122,255)' textColor='white' title='CONTRATAR' onPress={()=>{
							App.modalPromptOpen(<PromptHireUser dataUser={this.props.navigation.state.params.dataUser}></PromptHireUser>);
						}}></ElementsInputButton>
					</View>
					{this.props.navigation.state.params.dataUser.data.JOB_CATEGORIES.map((l,i)=>{
						//return <Text>ddd</Text>
						return <ElementsProfileCardCategory dataCategory={l} descriptionOnly={false}></ElementsProfileCardCategory>
					})}

				</ScrollView>
			</SafeAreaView>
		)
	}
}

/* -- NEW JOB SCREEN */
export class ScreenNewJob extends React.Component{
  static navigationOptions = {
    headerTitle: ' ',
    headerStyle: {borderBottomColor: 'transparent', borderBottomWidth: 0, backgroundColor: 'white', height: 0},
    cardStyle: {backgroundColor: 'white'}
  }
  state={
    selectCategoryObj: {
      'ID': 'CERCA',
      'COLLECTION': 'material',
      'ICON': 'location-on',
      'SERVICES': ['hello'],
    },
    jobDetailsDescription: null,
    jobDetailsServices: [],
		jobDetailsLocation: null
  }
  returnButtonEnabled(condition){
    if(condition){
      return 'fill'
    } else {
      return 'disabled'
    }
    this.forceUpdate();
  }


	publishTask(){
		if(this.state.selectCategoryObj.ID == 'CERCA' || !this.state.jobDetailsDescription){
			alert('INGRESA TODOS LOS DATOS');
		} else {
			firebase.firestore().collection("TASKS").doc().set({
				ADDRESS: this.state.jobDetailsLocation.address,
				LOCATION: new firebase.firestore.GeoPoint( this.state.jobDetailsLocation.coords.latitude, this.state.jobDetailsLocation.coords.longitude ),
				DESCRIPTION: this.state.jobDetailsDescription,
				CATEGORY: this.state.selectCategoryObj.ID,
				STATUS: 'UNASIGNED',
				LAST_UPDATE: new Date(),
				USERS: [
					{
						UID: firebase.auth().currentUser.uid,
						ROLE: 'CLIENT'
					}
				],
				CONTENT: [
					{
						CONTENT: "PUBLISHED",
						DATE: new Date(),
						TYPE: "INFO"
					}
				]
			}).then(()=>{
				App.modalPromptOpen(
					<PromptSuccess title='LA TAREA FUE PUBLICADA CON ÉXITO' subtitle='Pudes ver actualizaciones en tu BUZÓN'></PromptSuccess>
				)
			})
		}
	}

  render(){
    return(
      <SafeAreaView style={{height: '100%', backgroundColor: 'white'}}>
        <ScrollView stickyHeaderIndices={[0]}>
					<View style={{padding: 16, paddingTop: 0, backgroundColor: 'white', paddingBottom: 0}}>
						<Text style={{margin: 8, fontSize: 40, fontWeight: '800', color: '#E69400'}}>Nueva Tarea</Text>
					</View>
					<View style={{padding: 16}}>
						<ElementsInputTextarea placeholder='Hola, me quede afuera de mi casa. Necesito un cerrajero.' onChangeText={(newText)=>{ this.setState({jobDetailsDescription: newText}) }}></ElementsInputTextarea>
          </View>
					<View style={{padding: 16}}>
						<ElementsInputLocation name='DIRECCIÓN' onChangeLocation={(newLoc)=>{ this.setState({jobDetailsLocation: newLoc}) }}></ElementsInputLocation>
					</View>
					<View style={{padding: 16}}>
						<ContainerCategories data={arrayCategoriesData} onSelectCategory={(selectCategoryObj) => { this.setState({selectCategoryObj:selectCategoryObj}) }}></ContainerCategories>
					</View>

        </ScrollView>
        <View style={{padding: 16, paddingTop: 4, paddingBottom: 4}}>
          <ElementsInputButton type='fill' title='PUBLICAR' buttonColor='#E69400' onPress={()=>{this.publishTask()}} />
        </View>
      </SafeAreaView>
    )
  }
}

/* -- SEETINGS AND MY PROFILE SCREEN */
export class ScreenSettings extends React.Component{
	userBio = '';
	userJobCategories = [];

	async updateProfilePic(){
		const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    let resultImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1,1]
    })
    if(!resultImage.cancelled){
			const newUserProfileResponse = await fetch(resultImage.uri);
			const newUserProfileBlob = await newUserProfileResponse.blob();
			firebase.storage().ref().child("PROFILE_PICS/"+firebase.auth().currentUser.uid).put(newUserProfileBlob);
			this.forceUpdate();
    }
	}

	updateProfileBio(){
		firebase.firestore().collection('USERS').doc(firebase.auth().currentUser.uid).update({
			'BIO': this.userBio
		})
	}

	async componentWillMount(){
		this.userBio =  await objCurrentUserData.data.BIO;
		this.userJobCategories =  await objCurrentUserData.data.JOB_CATEGORIES;
		this.forceUpdate();
	}
	render(){
		return(
			<SafeAreaView style={{backgroundColor: 'white'}}>
				<ScrollView stickyHeaderIndices={[1]}>
					<View style={{padding: 16, paddingTop: 0, paddingBottom: 0}}>
						<Text style={{margin: 8, fontSize: 40, fontWeight: '800', color: '#E69400'}}>Tu perfil</Text>
					</View>
					<View style={{padding: 16, paddingTop: 0, paddingBottom: 0, backgroundColor: 'white', borderBottomColor: 'rgba(160,160,160,0.2)', borderBottomWidth: 1}}>
						<ElementsProfileListItem dataUser={objCurrentUserData} onPress={()=>{ this.updateProfilePic() }}></ElementsProfileListItem>
					</View>
					<View style={{padding: 16, paddingBottom: 0}}>
						<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>BIOGRAFÍA</Text>
						<ElementsInputTextarea value={this.userBio} placeholder='BIOGRAFÍA' fontSize={16} onChangeText={(newText)=>{
							console.log(newText)
						}}></ElementsInputTextarea>
						<ElementsInputButton type='fill' title='ACTUALIZAR INFORMACIÓN' buttonColor='rgb(0,122,255)' onPress={()=>{this.updateProfileBio()}} />
					</View>
					<View style={{padding: 16, paddingBottom: 0}}>
						<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>PERFILES</Text>
					</View>
					{this.userJobCategories.map((l,i)=>{
						return <ElementsProfileCardCategory dataCategory={l} key={i} type='card' descriptionOnly={true} onPress={()=>{
							App.modalPromptOpen(<PromptEditCategory objCurrentUserData={objCurrentUserData} categoryData={l}></PromptEditCategory>)
						}}></ElementsProfileCardCategory>
					})}
					<View style={{padding: 16}}>
						<ElementsInputButton type='fill' title='AÑADIR PERFIL' buttonColor='rgba(160,160,160,0.2)' onPress={()=>{
							App.modalPromptOpen(<PromptAddCategory onAddCategory={()=>{this.forceUpdate()}}></PromptAddCategory>)
						}}></ElementsInputButton>
					</View>
				</ScrollView>
			</SafeAreaView>
		)
	}
}

export class ScreenExplore extends React.Component{
	static navigationOptions = {
    headerTitle: ' ',
    headerStyle: {borderBottomColor: 'transparent', borderBottomWidth: 0, backgroundColor: 'white', height: 0},
  }
	state={
		'locationResult': {'longitude': 0, 'latitude': 0},
		'locationAddress': 'Ubicación no disponible'
	}
	arrayWorkers = [];
	getWorkers(){
		var arrayWorkers = [];
		firebase.firestore().collection('USERS').onSnapshot((data)=>{
			arrayWorkers = [];
			data.forEach((doc)=>{
				arrayWorkers.push({ 'ID': doc.id, 'data': doc.data() });
			});
			this.arrayWorkers = arrayWorkers;
			this.forceUpdate();
		});
	}

	async getCurrentLocation(){

		let locationResult = await Location.getCurrentPositionAsync();
		this.setState({locationResult: locationResult.coords});

		let locationAddress = await Location.reverseGeocodeAsync({latitude: locationResult.coords.latitude, longitude: locationResult.coords.longitude})
  	this.setState({ locationAddress:  locationAddress[0].name + ', '  + locationAddress[0].city + ' ' + locationAddress[0].postalCode + ' ' + locationAddress[0].region });
	}


	async componentWillMount(){
		this.getCurrentLocation();
		this.getWorkers();
	}
	render(){
		return(
			<SafeAreaView style={{backgroundColor: 'white'}}>
				<ScrollView stickyHeaderIndices={[1]}>
					<MapView style={{width: '100%', height: Dimensions.get('window').height*0.5 }} region={{
						latitude: this.state.locationResult.latitude,
						longitude: this.state.locationResult.longitude,
						latitudeDelta: 0.002,
						longitudeDelta: 0.002,
					}} >
						<MapView.Marker coordinate={{latitude: this.state.locationResult.latitude, longitude: this.state.locationResult.longitude}} ref='marker'>
							<MapView.Callout tooltip={this.state.locationAddress} />
						</MapView.Marker>
						<LinearGradient colors={['white', 'rgba(255,255,255,0.4)']} start={[0.5,0]} end={[0.5,0.2]} style={{padding: 16, paddingTop: 0, height: '100%'}}>
							<Text style={{margin: 8, fontSize: 40, fontWeight: '800', color: '#E69400'}}>Explorar</Text>
							<Text style={{margin: 8, fontWeight: '600', fontSize: 16}}>CERCA DE:{"\n"}{this.state.locationAddress} </Text>
						</LinearGradient>
					</MapView>

					<ElementsHeaderToolbar>
						<ElementsInputName name='BUSCAR' onChangeText={(newText)=>{console.log(newText)}}  compact={true} flyOutTitle={false}></ElementsInputName>
					</ElementsHeaderToolbar>

					<View style={{padding: 16}}>
						<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>Tareas cerca de mí</Text>
						{this.props.screenProps.arrayTasksData.filter((item) => item.data.STATUS == 'UNASIGNED' ).map((l,i)=>{
							return <ElementsTaskListItem dataTask={l} onPress={()=>{ this.props.navigation.navigate('ScreenExploreTask', {dataTask: l}) }}/>
						})}
					</View>
					<View style={{padding: 16}}>
						<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>Trabajadores cercanos</Text>
						{this.arrayWorkers.map((l,i)=>{
							return <ElementsProfileListItem dataUser={l} key={i} onPress={()=>{ this.props.navigation.navigate('ScreenExploreProfile', {dataUser: l}) }}></ElementsProfileListItem>
						})}
					</View>
				</ScrollView>
			</SafeAreaView>
		)
	}

	componentDidMount(){
		this.refs.marker.showCallout()
	}

}

export class ScreenTasks extends React.Component{
	static navigationOptions = {
		headerTitle: ' ',
		headerStyle: {borderBottomColor: 'transparent', borderBottomWidth: 0, backgroundColor: 'white', height: 0},
	}
	arrayTasks = [];
	currentUserFirstName = '';

	async componentWillMount(){
		//this.getTasks();
		this.currentUserFirstName = await objCurrentUserData.data.NAME.split(" ")[0];
		this.forceUpdate();
	}

	componentWillReceiveProps(){
		this.forceUpdate();
	}

	renderTasks(){
		return this.props.screenProps.arrayTasksData.filter((item) => item.notifyUser == true ).sort( (a,b)=> b.data.LAST_UPDATE-a.data.LAST_UPDATE ).map((l,i)=>{
			return <ElementsNotificationListItem dataTask={l} key={l.ID} onPress={()=>{
				this.props.navigation.navigate("ScreenTasksConversation", {dataTask: l })
			}}></ElementsNotificationListItem>
		})
	}

	render(){
		return(
			<SafeAreaView style={{backgroundColor: 'white', height: '100%'}}>
				<ScrollView stickyHeaderIndices={[0]}>
					<View style={{padding: 16, paddingTop: 0, paddingBottom: 0, backgroundColor: 'white'}}>
						<Text style={{margin: 8, fontSize: 40, fontWeight: '800', color: '#E69400'}}>Buzón</Text>
					</View>
					<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 0, paddingBottom: 0}} onPress={()=>{
						this.props.navigation.navigate('ScreenSettings');
					}}>
						<View style={{margin: 8}}>
							<Text style={{fontSize: 16}}>BUENOS DÍAS,</Text>
							<Text style={{fontSize: 24, fontWeight: '800'}}>{this.currentUserFirstName}</Text>
						</View>
						<View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: 'black', margin: 8}}></View>
					</TouchableOpacity>
					<View style={{padding: 16}}>
						{this.renderTasks()}
					</View>
					<View style={{padding: 16}}>
						<ElementsInputButton title='CERRAR SESIÓN' buttonColor='rgba(200,200,200,0.6)' type='fill' onPress={()=>{firebase.auth().signOut()}} />
					</View>

				</ScrollView>
			</SafeAreaView>
		)
	}
	componentDidMount(){
		this.forceUpdate();
	}
}

let thisScreenTasksConversations;
export class ScreenTasksConversation extends React.Component{

	static navigationOptions = ({navigation}) => ({
		//header: <SafeAreaView style={{backgroundColor: 'white', padding: 16, paddingTop: 0, paddingBottom: 0}}><ElementsNotificationListItem dataTask={navigation.state.params.dataTask} /></SafeAreaView>
	})

	chatScrollView;
	arrayInterestedWorkers = []
	getInterestedWorkers(){
		this.props.navigation.state.params.dataTask.data.USERS.filter((item) => item.UID != firebase.auth().currentUser.uid).map((l,i)=>{
			firebase.firestore().collection('USERS').doc(l.UID).get().then((doc)=>{
				this.arrayInterestedWorkers.push({'ID': doc.id, 'data': doc.data()})
				this.forceUpdate();
			})
		})
	}


	renderInterestedWorkers(){
		if(this.props.navigation.state.params.dataTask.data.STATUS == 'UNASIGNED' && this.props.navigation.state.params.dataTask.userRole == 'CLIENT'){
			return(
				<View style={{padding: 16}}>
					<Text style={{margin: 8, fontSize: 24, fontWeight: '800'}}>INTERESADOS</Text>
					{this.arrayInterestedWorkers.map((l,i)=>{
						return <ElementsProfileListItem dataUser={l} onPress={()=>{
							App.modalPromptOpen(<PromptUserProfile dataUser={l} dataCategoryUser={this.props.navigation.state.params.dataTask.data.CATEGORY} onHire={()=>{ UtilitiesTask.userHire( this.props.navigation.state.params.dataTask , l.ID ) }}></PromptUserProfile>)
						}}>
							<ElementsInputButton compact type='fill' title='CONTRATAR' onPress={()=>{ UtilitiesTask.userHire( this.props.navigation.state.params.dataTask , l.ID ) }}></ElementsInputButton>
						</ElementsProfileListItem>
					})}
				</View>
			)
		}
	}

	renderTaskContents(){
		if(this.props.navigation.state.params.dataTask.data.STATUS == 'ACTIVE'){
			return(
				<View style={{padding: 8}}>
					<Text style={{margin: 16, fontSize: 24, fontWeight: '800'}}>CONVERSACIÓN</Text>
					{this.props.navigation.state.params.dataTask.data.CONTENT.map((l,i)=>{
						if(l.TYPE == 'MESSAGE'){
							return <ElementsChatBubble dataContent={l} />
						} else if ( l.TYPE == 'INFO'){
							return <ElementsChatInfo dataContent={l} />
						} else if ( l.TYPE == 'MESSAGE/LOCATION'){
							return <ElementsChatLocation dataContent={l} />
						} else if ( l.TYPE == 'SERVICE'){
							return <ElementsChatService dataContent={l} />
						} else {
							return <Text style={{margin: 8}}>{JSON.stringify(l)}</Text>
						}
					})}
				</View>
			)
		}
	}

	componentWillReceiveProps(){
		this.forceUpdate();
	}

	componentWillMount(){
		this.getInterestedWorkers();
	}

	render(){
		return(
			<SafeAreaView style={{backgroundColor: 'white', flex: 1}}>
				<ScrollView snapToAlignment='end' ref='chatScrollView'>
					<ElementsTaskDetails dataTask={this.props.navigation.state.params.dataTask}></ElementsTaskDetails>
					{this.renderInterestedWorkers()}
					{this.renderTaskContents()}

				</ScrollView>
				<ElementsChatToolbar dataTask={this.props.navigation.state.params.dataTask} ></ElementsChatToolbar>
			</SafeAreaView>
		)
	}
	componentDidMount(){
		this.refs.chatScrollView.scrollToEnd();
	}
}

const AppContents = TabNavigator({
	TabScreenExplore: {
		screen: StackNavigator({
			ScreenExplore: { screen: ScreenExplore},
			ScreenExploreProfile: {screen: ScreenProfile},
			ScreenExploreTask: {screen: ScreenTasksConversation},
		}, {headerMode: 'screen'}),
		navigationOptions: ()=>({
			tabBarLabel: 'Explorar',
			tabBarIcon: ({tintColor}) => (<MaterialIcons name='search' size={32} color={tintColor}></MaterialIcons>)
		})
	},
	TabScreenNewJob: {
		screen: StackNavigator({
			ScreenNewJob: {screen: ScreenNewJob}
		}),
		navigationOptions: ()=>({
			tabBarLabel: 'Nuevo',
			tabBarIcon: ({tintColor}) => (<MaterialIcons name='add-box' size={32} color={tintColor}></MaterialIcons>)
		})
	},
	TabScreenTasks: {
		screen: StackNavigator({
			ScreenTasks: {screen: ScreenTasks},
			ScreenTasksConversation: {screen: ScreenTasksConversation},
			ScreenSettings: {screen: ScreenSettings},
			ScreenTasksProfile: {screen: ScreenProfile}
		}, {headerMode: 'screen'}),
		navigationOptions: ()=>({
			tabBarLabel: 'Buzón',
			tabBarIcon: ({tintColor}) => (<MaterialIcons name='notifications' size={32} color={tintColor}></MaterialIcons>),
		})
	}
},
{
	tabBarPosition: 'bottom',
	navigationOptions: ({navigation})=>({
		tabBarVisible: !navigation.state.index > 0,
		swipeEnabled:  !navigation.state.index > 0
	}),
	tabBarOptions: {
		activeTintColor: '#E69400',
		showIcon: true,
		showLabel: true,
		style: {padding: 0}
	}
})



let thisApp;
export default class App extends React.Component {
  state={isUserLoggedIn: false}
	static modalPromptShow = false;
	static modalPromptContents = null;

	static modalPromptOpen(contents){
		App.modalPromptShow = true;
		App.modalPromptContents = contents;
		thisApp.forceUpdate();
	}
	static modalPromptClose(){
		App.modalPromptShow = false;
		App.modalPromptContents = null;
		thisApp.forceUpdate();
	}


	renderModalPrompt(){
		if(App.modalPromptShow){
			return(
				<BlurView tint='light' intensity={80} style={{height: '100%', width: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10, justifyContent: 'center'}}>
					<SafeAreaView style={{justifyContent: 'center', height: '100%', width: '100%'}}>
					{App.modalPromptContents}
					</SafeAreaView>
				</BlurView>
			)
		}
	}

	getCurrentUserData(){
		firebase.firestore().collection('USERS').doc(firebase.auth().currentUser.uid).onSnapshot((doc)=>{
			this.forceUpdate();
			objCurrentUserData = {'ID': doc.id, 'data': doc.data()}
		}).then(()=>{
			this.forceUpdate();
		})
	}
	getCategoriesData(){
		firebase.firestore().collection('CATEGORIES').onSnapshot((data)=>{
			this.forceUpdate();
			arrayCategoriesData = [];
			data.forEach((doc)=>{
				arrayCategoriesData.push({'ID': doc.id, 'data': doc.data()})
			});
			this.forceUpdate();
		});
	}
	getTasksData(){
		firebase.firestore().collection('TASKS').onSnapshot((data)=>{
			//alert('UPDATE TO TASKS')
			this.forceUpdate();
			arrayTasksData = [];
			data.forEach((doc)=>{
				let notifyUser = doc.data().USERS.find((USER) => USER.UID === firebase.auth().currentUser.uid);
				let userRole = 'PUBLIC';
				if(notifyUser != undefined){
					userRole = notifyUser['ROLE'];
				}

				arrayTasksData.push({'ID': doc.id, 'data': doc.data(), 'userRole': userRole, 'notifyUser': notifyUser != undefined});
			});
			this.forceUpdate();
		});
	}
  async componentWillMount(){
		thisApp = this;
		//alert(expoPushToken);

    var config = {
      apiKey: "AIzaSyB2tCpkhMMJLGceChtUdrf0PqvpoZtHO74",
      authDomain: "mango-db.firebaseapp.com",
      databaseURL: "https://mango-db.firebaseio.com",
      projectId: "mango-db",
      storageBucket: "mango-db.appspot.com",
      messagingSenderId: "853709775137"
    };
    firebase.initializeApp(config);
    //Detect login/register
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({isUserLoggedIn: true});
				this.getCurrentUserData();
      }
      else {
        this.setState({isUserLoggedIn: false})
      }
      this.forceUpdate();
    });
		this.getCategoriesData();
		this.getTasksData();
		this.forceUpdate();
  }
  render(){
    if(this.state.isUserLoggedIn){
      return(
				<KeyboardAvoidingView style={{height: '100%', width: '100%', flex: 1}} behavior='padding'>
					{this.renderModalPrompt()}
					<AppContents screenProps={{
						'arrayTasksData': arrayTasksData
					}}></AppContents>
				</KeyboardAvoidingView>
			)
    } else {
      return <PromptLogin></PromptLogin>
    }
  }

	async componentDidMount(){
		//if(this.state.isUserLoggedIn){
			await Permissions.askAsync(Permissions.NOTIFICATIONS);
			await Permissions.askAsync(Permissions.LOCATION);

			let expoPushToken = await Notifications.getExpoPushTokenAsync();
			let locationResult = await Location.getCurrentPositionAsync();
			//this.setState({locationResult: locationResult.coords});

			firebase.firestore().collection('USERS').doc( firebase.auth().currentUser.uid ).update({
				EXPO_PUSH_TOKEN: expoPushToken,
				LOCATION: new firebase.firestore.GeoPoint(locationResult.coords.latitude, locationResult.coords.longitude)
			})
		//}
	}

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/*
**
** EDVILME 2018
**
*/
