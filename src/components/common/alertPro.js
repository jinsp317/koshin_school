import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text, View, Animated, Modal, TouchableOpacity, StyleSheet } from "react-native";

const SUPPORTED_ORIENTATIONS = [
  "portrait",
  "portrait-upside-down",
  "landscape",
  "landscape-left",
  "landscape-right"
];

class AlertPro extends Component {
  constructor() {
    super();
    this._arg = undefined;
    this.state = { visible: false };
    this.springValue = new Animated.Value(0);

    this.onCancel = this.onCancel.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  onCancel() {
    const { onCancel } = this.props;
    this.close();
    if (typeof onCancel === "function") onCancel();
  }

  onConfirm() {
    const { onConfirm } = this.props;
    this.close();
    if (typeof onConfirm === "function") onConfirm();
  }

  open() {
    const { useNativeDriver } = this.props;
    this.setState({ visible: true }, () => {
      /* 타이머들이 동작할때는 애니매이션이 이상하게 동작해서 취소함...
        Animated.spring(this.springValue, {
        toValue: 1,
        speed: 35,
        bounciness: 7,
        velocity: 15,
        useNativeDriver
      }).start();
      */
    });
  }

  close() {
    const { onClose } = this.props;
    this.setState({ visible: false }, () => {
      this.springValue.setValue(0);
      if (typeof onClose === "function") onClose();
    });
  }

  render() {
    const {
      title,
      message,
      showCancel,
      showConfirm,
      textCancel,
      textConfirm,
      customStyles,
      closeOnPressMask,
      closeOnPressBack
    } = this.props;

    const { visible } = this.state;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        supportedOrientations={SUPPORTED_ORIENTATIONS}
        onRequestClose={closeOnPressBack ? this.close : null}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeOnPressMask ? this.close : null}
          style={[styles.background, customStyles.mask]}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: this.springValue }]
              },
              customStyles.container
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.content}>
                <Text style={[styles.title, customStyles.title]}>{title}</Text>
                {message ? (
                  <Text style={[styles.message, customStyles.message]}>{message}</Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                {showCancel ? (
                  <TouchableOpacity
                    testID="buttonCancel"
                    onPress={this.onCancel}
                    style={[styles.button, styles.buttonCancel, customStyles.buttonCancel]}
                  >
                    <Text style={[styles.textButton, customStyles.textCancel]}>{textCancel}</Text>
                  </TouchableOpacity>
                ) : null}
                {showConfirm ? (
                  <TouchableOpacity
                    testID="buttonConfirm"
                    onPress={this.onConfirm}
                    style={[styles.button, customStyles.buttonConfirm]}
                  >
                    <Text style={[styles.textButton, customStyles.textConfirm]}>{textConfirm}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }
}

AlertPro.propTypes = {
  customStyles: PropTypes.objectOf(PropTypes.object),
  title: PropTypes.string,
  message: PropTypes.string,
  showCancel: PropTypes.bool,
  showConfirm: PropTypes.bool,
  textCancel: PropTypes.string,
  textConfirm: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
  closeOnPressMask: PropTypes.bool,
  closeOnPressBack: PropTypes.bool,
  useNativeDriver: PropTypes.bool
};

AlertPro.defaultProps = {
  customStyles: {},
  title: "达乐血糖",
  message: "",
  showCancel: true,
  showConfirm: true,
  textCancel: "取消",
  textConfirm: "确定",
  closeOnPressMask: true,
  closeOnPressBack: true,
  useNativeDriver: false,
  onCancel: null,
  onConfirm: null,
  onClose: null
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    backgroundColor: "#FFF",
    maxWidth: 350,
    marginHorizontal: 30,
    borderRadius: 5
  },
  content: {
    justifyContent: "center",
    padding: 20
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
    lineHeight: 25
  },
  message: {
    textAlign: "center",
    fontSize: 17,
    color: "#666",
    paddingTop: 10
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 5,
    flexWrap: "wrap"
  },
  button: {
    backgroundColor: "#00ACEF",
    marginBottom: 20,
    marginHorizontal: 10,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
    minWidth: 120
  },
  buttonCancel: {
    backgroundColor: "#F53D3D"
  },
  textButton: {
    fontSize: 15,
    textAlign: "center",
    color: "#FFF",
    fontWeight: "600"
  }
});

export default AlertPro;
