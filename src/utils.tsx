import {TransactionBlock} from '@mysten/sui.js/transactions';
import {fromHEX} from '@mysten/sui.js/utils';

export function payload2Hex(payloadStr: string) {
	if (isHex(payloadStr)) {
		return payloadStr;
	} else {
		return base64ToHex(payloadStr);
	}
}

export function payload2Transaction(payloadStr: string) {
	if (isHex(payloadStr)) {
		return TransactionBlock.from(fromHEX(payloadStr));
	} else {
		return TransactionBlock.from(base64ToHex(payloadStr));
	}
}

function base64ToHex(base64: string): string {
	return Buffer.from(base64, 'base64').toString('hex');
}

function isHex(str: string): boolean {
	const hexRegex = /^[0-9a-fA-F]+$/;
	return hexRegex.test(str);
}