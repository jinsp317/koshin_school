import { Platform, StyleSheet } from "react-native";
import { themes } from "@src/core/themes";
import { textStyle } from "@src/components/common/style";

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes["App Theme"]["mycolor-lightgray"],
    ...Platform.select({
      ios: {
        paddingTop: 83
      }
    })
  },
  progressBar: {
    backgroundColor: themes["App Theme"]["mycolor-background"],
    padding: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  seperator: {
    marginTop: 10,
    backgroundColor: "#8E8E8E"
  },
  toolbarContainer: {
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 3,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: themes["App Theme"]["mycolor-lightgray"], // themes["App Theme"]["color-primary-300"],
    backgroundColor: "white", // themes["App Theme"]["color-primary-500"],
    height: 43,
    width: "100%"
  },
  toolbarText: {
    fontSize: 16,
    color: themes["App Theme"]["color-primary-500"],
    fontWeight: "400"
  },
  linkItemText: {
    color: themes["App Theme"]["color-primary-500"],
  },


  toolbarSubContianer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  textMain: {
    ...textStyle.subtitle,
    fontSize: 18,
    color: themes["App Theme"]["color-basic-900"]
  },
  textWarning: {
    ...textStyle.subtitle,
    fontSize: 18,
    color: themes["App Theme"]["color-warning-500"]
  },
  textSubtitle: {
    ...textStyle.subtitle,
    fontSize: 16,
    color: themes["App Theme"]["#ccc"] // ["color-basic-900"]
  },
  textHeader: {
    ...textStyle.subtitle,
    color: themes["App Theme"]["#ccc"] // ["color-basic-900"]
  },
  textParagraph: {
    ...textStyle.paragraph,
    fontSize: 18,
    color: themes["App Theme"]["color-basic-600"]
  },
  textParagraph_s: {
    ...textStyle.paragraph,
    fontSize: 16,
    color: themes["App Theme"]["color-basic-600"]
  },
  textLink: {
    ...textStyle.paragraph,
    fontSize: 18,
    color: themes["App Theme"]["color-primary-500"]
  },
  detailText: {
    ...textStyle.paragraph,
  },
  tabTitleNormal: {
    padding: 3
  },
  tabTitleWhite: {
    padding: 3,
    color: "white"
  },
  tabBarStyle: {
    backgroundColor: themes["App Theme"]["color-primary-500"],
    borderTopWidth: 0.5,
    borderColor: themes["App Theme"]["color-primary-300"]
  },
  tabBarIndicator: {
    backgroundColor: "white"
  },
  iconPeople: {
    width: 20,
    height: 20,
    tintColor: "darkgray"
  },
  iconMark: {
    marginLeft: 2,
    width: 16,
    height: 16
  },
  iconMarkNew: {
    width: 30,
    height: 13
  },
  iconAvata: {
    width: 30,
    height: 30
  },
  iconTask: {
    width: 16,
    height: 16,
    tintColor: themes["App Theme"]["color-warning-500"]
  },
  sectionText: {
    ...textStyle.subtitle,
    color: themes["App Theme"]["#ccc"],
    fontSize: 18
  },
  blankContainer: {
    flex: 1,
    paddingTop: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  slideMenuText: { fontSize: 18, color: themes["App Theme"]["#ccc"], fontWeight: "normal" },
  slideMenuText_1: {
    fontSize: 18,
    color: themes["App Theme"]["color-basic-900"],
    textAlign: 'left',
    fontWeight: "normal"
  },
  slideMenuText_2: {
    fontSize: 18,
    color: themes["App Theme"]["color-primary-500"],
    fontWeight: "normal"
  },
  slideMenuTrigger: { borderWidth: 0, paddingVertical: 3, paddingHorizontal: 6 },
  glucoseWarningText: {
    color: "white",
    backgroundColor: "green",
    borderRadius: 3,
    padding: 3,
    minWidth: 38,
    textAlign: "center"
  }
});

export default commonStyles;
