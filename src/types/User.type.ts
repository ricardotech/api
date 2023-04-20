type UserApple = {
    authorizationCode: string;
    email: string;
    fullName: {
      familyName: string;
      givenName: string;
      middleName: string;
      namePrefix: string;
      nameSuffix: string;
      nickname: string;
    };
    identityToken: string;
    realUserStatus: number;
    state: string;
    user: string;
  };
  
  type UserGoogle = {
    id: string;
    email: string;
    family_name: string;
    given_name: string;
    locale: string;
    name: string;
    picture: string;
    verified_email: boolean;
  };
  
  export type User = {
    _id: string;
    createdAt?: string;
    role: [string];
    name: string;
    username: string;
    email: string;
    thumbnail?: string;
    password: string;
    config?: {
      introVisualized: boolean;
    };
  };
  