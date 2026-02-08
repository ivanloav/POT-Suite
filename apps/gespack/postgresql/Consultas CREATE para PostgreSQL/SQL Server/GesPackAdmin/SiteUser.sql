USE [GesPackAdmin]
GO

/****** Object:  Table [dbo].[SiteUser]    Script Date: 02/11/2024 11:18:01 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SiteUser](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[USER_ID] [int] NOT NULL,
	[SITE_ID] [int] NOT NULL
) ON [PRIMARY]
GO


