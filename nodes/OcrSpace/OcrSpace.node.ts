import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IBinaryData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import FormData from 'form-data';

export class OcrSpace implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OCR.space',
		name: 'ocrSpace',
		icon: { light: 'file:ocrspace.svg', dark: 'file:ocrspace.svg' },
		group: ['transform'],
		version: 1,
		subtitle: 'Extract text from images',
		description: 'Extract text from images using OCR.space API',
		defaults: {
			name: 'OCR.space',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'ocrSpaceApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary property containing the image to OCR',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{
						name: 'Auto-detect (Engine 2 only)',
						value: 'auto',
					},
					{
						name: 'Arabic',
						value: 'ara',
					},
					{
						name: 'Bulgarian',
						value: 'bul',
					},
					{
						name: 'Chinese (Simplified)',
						value: 'chs',
					},
					{
						name: 'Chinese (Traditional)',
						value: 'cht',
					},
					{
						name: 'Croatian',
						value: 'hrv',
					},
					{
						name: 'Czech',
						value: 'cze',
					},
					{
						name: 'Danish',
						value: 'dan',
					},
					{
						name: 'Dutch',
						value: 'dut',
					},
					{
						name: 'English',
						value: 'eng',
					},
					{
						name: 'Finnish',
						value: 'fin',
					},
					{
						name: 'French',
						value: 'fre',
					},
					{
						name: 'German',
						value: 'ger',
					},
					{
						name: 'Greek',
						value: 'gre',
					},
					{
						name: 'Hungarian',
						value: 'hun',
					},
					{
						name: 'Italian',
						value: 'ita',
					},
					{
						name: 'Japanese',
						value: 'jpn',
					},
					{
						name: 'Korean',
						value: 'kor',
					},
					{
						name: 'Polish',
						value: 'pol',
					},
					{
						name: 'Portuguese',
						value: 'por',
					},
					{
						name: 'Russian',
						value: 'rus',
					},
					{
						name: 'Slovenian',
						value: 'slv',
					},
					{
						name: 'Spanish',
						value: 'spa',
					},
					{
						name: 'Swedish',
						value: 'swe',
					},
					{
						name: 'Turkish',
						value: 'tur',
					},
				],
				default: 'auto',
				description: 'Language to use for OCR',
			},
			{
				displayName: 'OCR Engine',
				name: 'OCREngine',
				type: 'options',
				options: [
					{
						name: 'Engine 1',
						value: '1',
						description: 'Default OCR engine',
					},
					{
						name: 'Engine 2',
						value: '2',
						description: 'Alternative OCR engine (better for certain image types)',
					},
				],
				default: '2',
				description: 'OCR engine to use for text extraction',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Detect Orientation',
						name: 'detectOrientation',
						type: 'boolean',
						default: false,
						description: 'Whether to automatically detect and correct image orientation',
					},
					{
						displayName: 'Get Word Coordinates',
						name: 'isOverlayRequired',
						type: 'boolean',
						default: false,
						description: 'Whether to return word-level bounding box coordinates',
					},
					{
						displayName: 'Scale Image',
						name: 'scale',
						type: 'boolean',
						default: false,
						description: 'Whether to scale the image for better OCR accuracy',
					},
					{
						displayName: 'Table Mode',
						name: 'isTable',
						type: 'boolean',
						default: false,
						description: 'Whether to optimize OCR for tables, receipts, and structured documents with line-by-line text parsing',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		this.logger.info('OcrSpace.execute');

		for (let i = 0; i < items.length; i++) {
			try {
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const language = this.getNodeParameter('language', i) as string;
				const ocrEngine = this.getNodeParameter('OCREngine', i) as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', i) as {
					detectOrientation?: boolean;
					isOverlayRequired?: boolean;
					scale?: boolean;
					isTable?: boolean;
				};

				const binaryData: IBinaryData | undefined = items[i].binary?.[binaryPropertyName];
				if (!binaryData) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data found in property: ${binaryPropertyName}`,
						{ itemIndex: i }
					);
				}
				const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				const fileName: string = binaryData.fileName || `document_${i}.${binaryData.fileExtension || 'jpg'}`;

				const formData = new FormData();
				formData.append('file', buffer, fileName);
				formData.append('filetype', binaryData.fileExtension || '');
				formData.append('language', language);
				formData.append('OCREngine', ocrEngine);

				if (additionalOptions.detectOrientation) {
					formData.append('detectOrientation', 'true');
				}
				if (additionalOptions.isOverlayRequired) {
					formData.append('isOverlayRequired', 'true');
				}
				if (additionalOptions.scale) {
					formData.append('scale', 'true');
				}
				if (additionalOptions.isTable) {
					formData.append('isTable', 'true');
				}

				this.logger.info(`Uploading file for OCR: ${fileName}`);

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'ocrSpaceApi',
					{
						method: 'POST',
						url: 'https://api.ocr.space/parse/image',
						body: formData,
					},
				);

				// Check for API errors
				if (response.OCRExitCode !== 1) {
					const errorMessage = response.ErrorMessage?.join(', ') || 'Unknown OCR error';
					throw new NodeOperationError(this.getNode(), `OCR.space API error: ${errorMessage}`, {
						itemIndex: i,
					});
				}

				// Extract text from response
				const parsedResults = response.ParsedResults || [];
				const extractedText = parsedResults
					.map((result: any) => result.ParsedText || '')
					.join('\n\n')
					.trim();

				// Prepare output data
				const outputData: INodeExecutionData = {
					json: {
						...items[i].json,
						extractedText,
						ocrResults: {
							fullResponse: response,
							processingTimeInMilliseconds: response.ProcessingTimeInMilliseconds,
							textOrientation: parsedResults[0]?.TextOrientation,
							fileParseExitCode: parsedResults[0]?.FileParseExitCode,
						},
					},
					binary: items[i].binary,
					pairedItem: {
						item: i,
					},
				};

				// Include word coordinates if requested
				if (additionalOptions.isOverlayRequired && parsedResults[0]?.TextOverlay) {
					outputData.json.wordCoordinates = parsedResults[0].TextOverlay.Lines;
				}

				returnData.push(outputData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							...items[i].json,
							error: error.message,
						},
						binary: items[i].binary,
						pairedItem: {
							item: i,
						},
					});
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
