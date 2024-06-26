"use client";

import { useAuthContext } from '@/contexts/auth/auth-context';
import Link from 'next/link';
import { Button } from './ui/button';
import ThemeToggleButton from './theme-toggle-button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import Logo from './icons/logo';

const Navbar = () => {
	const { logout, isAuthenticated } = useAuthContext();
	return (

		<header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
			<nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
				<Link
					href="/"
					className="flex items-center gap-2 text-lg font-semibold md:text-base"
				>
					<Logo className="w-10 h-10" />
					<span className="sr-only">Pomodoro App Logo</span>
				</Link>
				{isAuthenticated() ? (
					<>
						<Link href={"/analytics"} className="text-muted-foreground transition-colors hover:text-foreground">
							Analytics
						</Link>
						<Button onClick={() => logout()}>Logout</Button>
					</>
				) : (
					<>
						<Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
							Login
						</Link>
						<Link href="/register" className="text-muted-foreground transition-colors hover:text-foreground">
							Register
						</Link>
					</>
				)}
			</nav>
			<Sheet>
				<SheetTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="shrink-0 md:hidden"
					>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle navigation menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left">
					<nav className="grid gap-6 text-lg font-medium">
						<Link
							href="/"
							className="flex items-center gap-2 text-lg font-semibold"
						>
							<Logo className="w-10 h-10" />
							<span className="sr-only">Pomodoro App Logo</span>
						</Link>
						{isAuthenticated() ? (
							<>
								<Link href={"/analytics"} className="text-muted-foreground hover:text-foreground">
									Analytics
								</Link>
								<Button onClick={() => logout()}>Logout</Button>
							</>
						) : (
							<>
								<Link href="/login" className="text-muted-foreground hover:text-foreground">
									Login
								</Link>
								<Link href="/register" className="text-muted-foreground hover:text-foreground">
									Register
								</Link>
							</>
						)}
					</nav>
				</SheetContent>
			</Sheet>
			<ThemeToggleButton className='ml-auto' />
		</header>
	)

};

export default Navbar;
