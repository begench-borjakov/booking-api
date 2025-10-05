import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from '../third-party/jwt/jwt-auth.guard'
import { CurrentUserId } from '../third-party/decorator/current-user.decorator'
import { TokenResponse } from './rto/token.response'
import { MeResponse } from './rto/me.response'
import { toMeResponse, toTokenResponse } from './mappers/auth.mapper'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Register & get JWT' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registered', type: TokenResponse })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<TokenResponse> {
    const r = await this.auth.register(dto.email, dto.password, dto.name)
    return toTokenResponse(r.access_token)
  }

  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'OK', type: TokenResponse })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    const r = await this.auth.login(dto.email, dto.password)
    return toTokenResponse(r.access_token)
  }

  @ApiOperation({ summary: 'Get current user (by JWT)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'OK', type: MeResponse })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUserId() userId: string): Promise<MeResponse> {
    const u = await this.auth.me(userId)
    return toMeResponse(u)
  }
}
