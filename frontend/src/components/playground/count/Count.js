function Count({ got, want }) {
    const validCount = countValidCharacters(got, want);

    return (
        <div className="Count">
            {validCount}
        </div>
    );
}

export default Count;