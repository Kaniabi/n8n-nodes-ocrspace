import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OcrSpaceApi implements ICredentialType {
	name = 'ocrSpaceApi';
	displayName = 'OCR.space API';
	documentationUrl = 'https://ocr.space/OCRAPI';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your OCR.space API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'apikey': '={{ $credentials.apiKey }}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.ocr.space',
			url: '/parse/image',
			method: 'POST',
			body: {
				url: 'https://via.placeholder.com/150x50/000000/FFFFFF?text=TEST',
				language: 'eng',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'OCRExitCode',
					value: 1,
					message: 'Authentication failed. Please check your API key.',
				},
			},
		],
	};
}