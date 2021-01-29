import { Observable, ObservableArray, Image, ImageSource } from '@nativescript/core';
import { SecureStorage } from 'nativescript-secure-storage';
import { PPQR } from './ppqr/pp-qr';

let secureStorage = new SecureStorage();

class Account extends Observable{
	private ppqr: PPQR;
	title: string;
	name: string;

	get id(): string{
		return this.ppqr.id.number;
	}

	get amount(): number{
		return this.ppqr.amount;
	}

	get amountString(): string{
		return '\u0E3F' + this.ppqr.amount?.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}

	get QR(): ImageSource{
		return this.ppqr.generateQR(500, 500);
	}

	get QRText(): string{
		return this.ppqr.toString();
	}

	constructor(title: string, name: string, ppqr: PPQR){
		super();
		this.title = title;
		this.name = name;
		this.ppqr = ppqr;
	}
}

export class AppModel extends Observable {
	mainAccountIndex: number = 0;
	accounts = new ObservableArray<Account>();
	constructor() {
		super();
		if(secureStorage.isFirstRun()){
			secureStorage.set({
				key: "accounts",
				value: '["0801602924", "1409901193553"]'
			});
			secureStorage.set({
				key: "0801602924",
				value: '{"title": "KBANK - Daily use","name": "Nattapong Siribal","type": "Phone","amount": ""}'
			});
			secureStorage.set({
				key: "1409901193553",
				value: '{"title": "GSB - Saving lotto","name": "ณัฐพงษ์ ศิริบาล","type": "NationalID","amount": "1000"}'
			});
		}

		let accs = JSON.parse(secureStorage.getSync({key: "accounts"}));
		accs.forEach(acc => {
			let data = JSON.parse(secureStorage.getSync({key: acc}));
			let ppqr: PPQR;
			switch (data.type) {
				case "Phone":
					ppqr = PPQR.fromPhone(acc);
					break;
				case "NationalID":
					ppqr = PPQR.fromNationalID(acc);
					break;
				case "EWallet":
					ppqr = PPQR.fromEWallet(acc);
					break;
			}
			if(Number(data.amount) > 0){
				ppqr.setAmount(Number(data.amount));
			}
			this.accounts.push(new Account(data.title, data.name, ppqr));
		});
	}

	// set message(value: string) {
	// 	if (this._message !== value) {
	// 		this._message = value;
	// 		this.notifyPropertyChange('message', value);
	// 	}
	// }

	// onTap() {
	// 	this._counter--;
	// 	this.updateMessage();
	// }

	// private updateMessage() {
	// 	if (this._counter <= 0) {
	// 		this.message =
	// 			'Hoorraaay! You unlocked the NativeScript clicker achievement!';
	// 	} else {
	// 		this.message = `${this._counter} taps left`;
	// 	}
	// }
}
