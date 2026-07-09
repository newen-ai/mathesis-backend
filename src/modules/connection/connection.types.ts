export type ConnectionUserSummary = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  connectedAt: string;
};

export type MyConnectionsOutput = {
  connections: ConnectionUserSummary[];
};

export type ConnectUserOutput = {
  connectedUserId: string;
  connectedAt: string;
  alreadyConnected: boolean;
};

export type DisconnectUserOutput = {
  disconnectedUserId: string;
};
