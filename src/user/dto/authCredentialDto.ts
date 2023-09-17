import { IsNotEmpty, Matches } from 'class-validator';

export class AuthCredentialDto {
  @IsNotEmpty({
    message: 'Email must not empty.',
  })
  @Matches(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    {
      message: 'Email is not valid.',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'Username must not empty.',
  })
  @Matches(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,16}$/, {
    message:
      'Password must be minimum six characters, at least one letter and one number.',
  })
  password: string;
}
