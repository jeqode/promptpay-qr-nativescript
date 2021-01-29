import { crc16 } from './crc16';
import { QrGenerator } from 'nativescript-qr-generator';
import { ImageSource } from '@nativescript/core';

let paddedStringOf = (value: number | string, maxLength: number, fillString: string = "0"): string => {
	let out: string = typeof(value) == 'number' ? value.toString() : value;
	return out.padStart(maxLength, fillString);
};

enum IDType {
	Phone = '01',
	NationalID = '02',
	EWallet = '03'
}
class ID{
	type: IDType;
	private _number: string;

	get number(): string {
		return this._number;
	}
	set number(value: string){
		let num = value.replace('/[^0-9]/g', '');
		switch (this.type) {
			case IDType.EWallet:
				if (num.length != 15) {
					throw 'Invalid ewallet number: 15 digits(0-9)';
				}
				break;
			case IDType.NationalID:
				if (num.length != 13) {
					throw 'Invalid national ID number: 13 digits(0-9)';
				}
				break;
			case IDType.Phone:
				if (num.length != 10) {
					throw 'Invalid phone number: 10 digits(0-9)';
				}
				break;
		}
		this._number = num;
	}

	constructor(type: IDType, number: string){
		this.type = type;
		this.number = number;
	}
}

enum QRType{
	Static = '11',
	Dynamic = '12'
}

type CountryCode = 'TH' | 'US';
enum CurrencyCode{
	TH = '764',
}

export class PPQR{
	static version: string = '01'
	type: QRType;
	amount?: number;
	id: ID;
	countryCode: CountryCode = 'TH';
	currencyCode: CurrencyCode = CurrencyCode.TH;
	
	constructor(type: QRType, id: ID, countryCode: CountryCode = 'TH', currencyCode: CurrencyCode = CurrencyCode.TH, amount?: number){
		this.type = type;
		this.id = id;
		this.countryCode = countryCode;
		this.currencyCode = currencyCode;
		this.amount = amount;
	}

	static fromPhone(number: string): PPQR{
		return new PPQR(QRType.Static, new ID(IDType.Phone, number));
	}
	static fromEWallet(number: string): PPQR{
		return new PPQR(QRType.Static, new ID(IDType.EWallet, number));
	}
	static fromNationalID(number: string): PPQR{
		return new PPQR(QRType.Static, new ID(IDType.NationalID, number));
	}

	setAmount(amount: number){
		if (amount > 0) {
			this.amount = amount;
			this.type = QRType.Dynamic;
		}else{
			throw 'Amount must be greather than zero'
		}
	}

	clearAmount(){
		this.amount = undefined;
		this.type = QRType.Static;
	}

	toString(): string{
		let id = this.id.number;
		if(this.id.type == IDType.Phone){
			id = '0066' + id.slice(1);
		}
		id = `${this.id.type}${paddedStringOf(id.length, 2)}${id}`;
		let merchant = `0016A000000677010111${id}`;
		let string = `0002${PPQR.version}`;
		string += `0102${this.type}`;
		string += `29${paddedStringOf(merchant.length, 2)}${merchant}`;
		string += `5802${this.countryCode}`;
		string += `5303${this.currencyCode}`
		if(this.amount){
			let strAmount = this.amount.toFixed(2);
			string += `54${paddedStringOf(strAmount.length, 2)}${strAmount}`
		}
		string += `6304`;
		string += paddedStringOf(crc16(string).toString(16), 4).toUpperCase();
		return string;
	}

	generateQR(width: number = 200, 
						height: number = 200, 
						color: string = '#0F0F0F', 
						backgroundColor: string = '#FFFFFF'): ImageSource{
		return new ImageSource(new QrGenerator().generate(<string>this.toString(), {
			size: {
				width: width, 
				height: height
			}, 
			color: color, 
			backgroundColor: backgroundColor
			}
		));
	}
}

export {}