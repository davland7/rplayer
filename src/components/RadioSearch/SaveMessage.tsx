interface SaveMessageProps {
	message: string;
}

const SaveMessage = ({ message }: SaveMessageProps) => (
	<div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg">
		{message}
	</div>
);

export default SaveMessage;
