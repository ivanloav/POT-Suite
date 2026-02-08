USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Bundles]    Script Date: 02/11/2024 11:07:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Bundles](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ID_BUNDLE] [int] NULL,
	[SKU_BUNDLE] [nvarchar](255) NULL,
	[SKU_WMS] [nvarchar](255) NULL,
	[QTY] [int] NULL,
	[DATE_CREATION] [datetime] NULL,
	[CREATED_BY] [nvarchar](255) NULL,
	[DATE_MODIF] [datetime] NULL,
	[MODIF_BY] [nvarchar](255) NULL,
	[IS_ACTIVE] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Bundles] ADD  CONSTRAINT [DF_Bundles_IS_ACTIVE]  DEFAULT ((0)) FOR [IS_ACTIVE]
GO


