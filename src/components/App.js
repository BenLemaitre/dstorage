import React, { Component } from "react";
import Navbar from "./Navbar";
import Main from "./Main";
import Web3 from "web3";

import DStorage from "../abis/DStorage.json";

import "./App.css";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying Metamask"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = DStorage.networks[networkId];
    if (networkData) {
      // assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address);
      this.setState({ dstorage });
      // get files amount
      const filesCount = await dstorage.methods.fileCount().call();
      this.setState({ filesCount });
      // load files and sort by newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call();
        this.setState({
          files: [...this.state.files, file],
        });
      }
    } else {
      window.alert("DStorage contract not deployed to detected network");
    }

    this.setState({ loading: false });
  }

  uploadFile = async (description) => {
    this.setState({ loading: true });
    try {
      const result = await ipfs.add(this.state.buffer);
      const { type, name } = this.state;

      this.state.dstorage.methods
        .uploadFile(result.path, result.size, type, name, description)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({
            loading: false,
            type: null,
            name: null,
          });
          window.location.reload();
        })
        .on("error", (e) => {
          window.alert("Error");
          this.setState({
            loading: false,
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    const reader = new window.FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name,
      });
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0000000000000",
      loading: true,
      files: [],
      type: null,
      name: null,
      dstorage: null,
    };
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <Main
          files={this.state.files}
          uploadFile={this.uploadFile}
          captureFile={this.captureFile}
        />
      </div>
    );
  }
}

export default App;
