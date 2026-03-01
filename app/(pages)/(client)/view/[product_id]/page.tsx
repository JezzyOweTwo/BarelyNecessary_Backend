'use client'

interface Props {
	params: {
		id: string;
	};
}

export default function Page({ params }: Props) {
	const { id } = params;

	return (
		<>
			<h1>This will be a view products page one day, I pray.</h1>
		</>
	);
}
