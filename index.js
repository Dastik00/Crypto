int stateTest()
{
	KeyPair me = sha3("Gav Wood");
	KeyPair myMiner = sha3("Gav's Miner");
//	KeyPair you = sha3("123");

	Defaults::setDBPath("/tmp");

	Overlay stateDB = State::openDB();
	BlockChain bc;
	State s(myMiner.address(), stateDB);

	cout << bc;

	// Sync up - this won't do much until we use the last state.
	s.sync(bc);

	cout << s;

	// Mine to get some ether!
	s.commitToMine(bc);
	while (s.mine(100).completed) {}
	bc.attemptImport(s.blockData(), stateDB);

	cout << bc;

	s.sync(bc);

	cout << s;

	// Inject a transaction to transfer funds from miner to me.
	bytes tx;
	{
		Transaction t;
		t.nonce = s.transactionsFrom(myMiner.address());
		t.value = 1000;			// 1e3 wei.
		t.receiveAddress = me.address();
		t.sign(myMiner.secret());
		assert(t.sender() == myMiner.address());
		tx = t.rlp();
	}
	s.execute(tx);

	cout << s;

	// Mine to get some ether and set in stone.
	s.commitToMine(bc);
	while (s.mine(100).completed) {}
	bc.attemptImport(s.blockData(), stateDB);

	cout << bc;

	s.sync(bc);

	cout << s;

	return 0;
}
