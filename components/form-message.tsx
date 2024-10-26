export type Message = {
    type: 'error' | 'success';
    content: string;
};

export function FormMessage({ message }: { message: Message }) {
    return (
        <div className="flex flex-col gap-2 w-full max-w-md text-sm">
            {'success' in message && (
                <div className="text-foreground border-l-2 border-foreground px-4">
                    {message.content}
                </div>
            )}
            {'error' in message && (
                <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
                    {message.content}
                </div>
            )}
            {'message' in message && (
                <div className="text-foreground border-l-2 px-4">
                    {message.content}
                </div>
            )}
        </div>
    );
}
