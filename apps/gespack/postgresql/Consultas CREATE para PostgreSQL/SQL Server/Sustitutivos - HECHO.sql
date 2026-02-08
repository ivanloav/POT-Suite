USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Sustitutivos]    Script Date: 02/11/2024 11:15:02 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Sustitutivos](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[REF_INICIO] [nvarchar](255) NULL,
	[CAT_INICIO] [nvarchar](255) NULL,
	[DESC_INICIO] [nvarchar](255) NULL,
	[REF_FIN] [nvarchar](255) NULL,
	[CAT_FIN] [nvarchar](255) NULL,
	[DESC_FIN] [nvarchar](255) NULL,
	[CANT_MAX] [int] NULL,
	[CANT_USED] [int] NULL,
	[DATE_CREATION] [datetime] NULL,
	[DATE_MAX] [datetime] NULL,
	[CREATED_BY] [nvarchar](255) NULL,
	[DATE_MODIF] [datetime] NULL,
	[MODIF_BY] [nvarchar](255) NULL,
	[ACTIVE] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Sustitutivos] ADD  CONSTRAINT [DF_Sustitutivos_ACTIVE]  DEFAULT ((0)) FOR [ACTIVE]
GO


