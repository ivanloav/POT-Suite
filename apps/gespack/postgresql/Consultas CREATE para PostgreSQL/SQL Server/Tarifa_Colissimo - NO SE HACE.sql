USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Tarifa_Colissimo]    Script Date: 02/11/2024 11:15:38 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Tarifa_Colissimo](
	[ID] [int] NOT NULL,
	[DESDE] [nvarchar](255) NULL,
	[HASTA] [nvarchar](255) NULL,
	[DOMICILIO_SIN_FIRMA] [nvarchar](255) NULL,
	[DOMICILIO_CON_FIRMA] [nvarchar](255) NULL,
 CONSTRAINT [PK_Tarifa_Colissimo] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


